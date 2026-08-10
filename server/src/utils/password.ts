import { User } from '../models/User.js';
import { AUTH } from '../config/constants.js';
import { ApiError } from '../middleware/error.js';

export const checkAccountLock = (user: { failedLoginAttempts: number; lockedUntil?: Date | null; isLocked: () => boolean }): void => {
  if (user.isLocked()) {
    const lockedUntil = user.lockedUntil ?? new Date();
    const remainingMs = lockedUntil.getTime() - Date.now();
    const remainingMin = Math.max(1, Math.ceil(remainingMs / 60000));
    throw new ApiError(423, `Account locked. Try again in ~${remainingMin} minute(s).`);
  }
  if (user.failedLoginAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
    throw new ApiError(
      423,
      `Account locked after ${AUTH.MAX_FAILED_ATTEMPTS} failed attempts. Try again in 15 minutes.`
    );
  }
};

export const recordFailedLogin = async (user: User): Promise<void> => {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + AUTH.LOCKOUT_MS);
  }
  await user.save();
};

export const resetLoginFailures = async (user: User): Promise<void> => {
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();
  }
};