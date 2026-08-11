import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
const sign = (payload, expiresIn) => jwt.sign(payload, env.JWT_SECRET, { expiresIn });
const signAccessToken = (userId, tokenVersion) => {
  return sign({ id: userId, type: 'access', tokenVersion }, env.JWT_ACCESS_EXPIRES_IN);
};
const signRefreshToken = (userId, tokenVersion) => {
  return sign({ id: userId, type: 'refresh', tokenVersion }, env.JWT_REFRESH_EXPIRES_IN);
};
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1e3);
  return { token, hash, expiresAt };
};
export { generatePasswordResetToken, hashToken, signAccessToken, signRefreshToken, verifyToken };
