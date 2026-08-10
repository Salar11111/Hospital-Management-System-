import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export interface TokenPayload {
  id: string;
  type: 'access' | 'refresh';
  tokenVersion: number;
}

const sign = (payload: TokenPayload, expiresIn: string): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });

export const signAccessToken = (userId: string, tokenVersion: number): string => {
  return sign({ id: userId, type: 'access', tokenVersion }, env.JWT_ACCESS_EXPIRES_IN);
};

export const signRefreshToken = (userId: string, tokenVersion: number): string => {
  return sign({ id: userId, type: 'refresh', tokenVersion }, env.JWT_REFRESH_EXPIRES_IN);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

export const generatePasswordResetToken = (): { token: string; hash: string; expiresAt: Date } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  return { token, hash, expiresAt };
};