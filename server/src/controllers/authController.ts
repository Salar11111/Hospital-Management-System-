import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { env } from '../config/env.js';
import { AUTH, COOKIE_NAMES, ROLES } from '../config/constants.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  hashToken,
  generatePasswordResetToken,
} from '../utils/token.js';
import { getCookieOptions, parseDurationToMs } from '../utils/cookies.js';
import { checkAccountLock, recordFailedLogin, resetLoginFailures } from '../utils/password.js';
import { writeAuditLog } from '../utils/audit.js';

const ACCESS_TOKEN_MS = parseDurationToMs(env.JWT_ACCESS_EXPIRES_IN);
const refreshCookieMs = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, getCookieOptions(env.COOKIE_SECURE, ACCESS_TOKEN_MS));
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, getCookieOptions(env.COOKIE_SECURE, refreshCookieMs));
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { httpOnly: true, sameSite: 'lax', path: '/' });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { httpOnly: true, sameSite: 'lax', path: '/' });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, phone, gender } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    gender,
  });

  if (role === ROLES.PATIENT) {
    await Patient.create({ user: user._id, name, contact: { email: user.email, phone: user.phone } });
  }

  res.status(201).json({ success: true, message: 'Account created successfully', data: user.toJSON() });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  checkAccountLock(user);

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Contact an administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await recordFailedLogin(user);
    const attemptsLeft = AUTH.MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
    throw new ApiError(401, `Invalid email or password. ${Math.max(0, attemptsLeft)} attempt(s) left.`);
  }

  await resetLoginFailures(user);

  user.lastLogin = new Date();
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();

  const accessToken = signAccessToken(user.id, user.tokenVersion);
  const refreshToken = signRefreshToken(user.id, user.tokenVersion);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);
  req.user = user as unknown as typeof req.user;
  await writeAuditLog({ req, action: 'login', resource: 'auth' });

  res.status(200).json({ success: true, message: 'Signed in successfully', data: user.toJSON() });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = (req.cookies as Record<string, string>)[COOKIE_NAMES.REFRESH_TOKEN];
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    clearAuthCookies(res);
    throw new ApiError(401, 'Refresh token is invalid or expired');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'Invalid token type');
  }

  const user = await User.findById(payload.id).select('+refreshTokenHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive');
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    clearAuthCookies(res);
    throw new ApiError(401, 'Session revoked, please sign in again');
  }

  if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    clearAuthCookies(res);
    throw new ApiError(401, 'Session token mismatch');
  }

  const newAccessToken = signAccessToken(user.id, user.tokenVersion);
  const newRefreshToken = signRefreshToken(user.id, user.tokenVersion);
  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save();

  setAuthCookies(res, newAccessToken, newRefreshToken);
  res.status(200).json({ success: true, message: 'Session refreshed', data: user.toJSON() });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await writeAuditLog({ req, action: 'logout', resource: 'auth' });
  }
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Signed out successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Do not leak whether the email exists.
  if (!user || !user.isActive) {
    res.status(200).json({
      success: true,
      message: 'If an account exists for this email, a reset link has been sent',
    });
    return;
  }

  const { token, hash, expiresAt } = generatePasswordResetToken();
  user.passwordResetTokenHash = hash;
  user.passwordResetTokenExpiresAt = expiresAt;
  await user.save();

  // NOTE: email delivery (Nodemailer/SendGrid) is deferred. In dev the reset token is logged.
  console.log(`[dev] Password reset link for ${email}: /auth/reset-password?token=${token}`);

  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, a password reset link has been sent',
    devToken: env.NODE_ENV === 'development' ? token : undefined,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hash = hashToken(token);

  const user = await User.findOne({ passwordResetTokenHash: hash }).select('+passwordResetTokenExpiresAt');
  if (!user || !user.passwordResetTokenExpiresAt) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    throw new ApiError(400, 'Reset token has expired. Please request a new one.');
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Password reset successfully. Please sign in.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: req.user });
});