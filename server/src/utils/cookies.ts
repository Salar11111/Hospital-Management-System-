import type { CookieOptions } from 'express';

export const parseDurationToMs = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return 60_000;
  const value = Number(match[1]);
  const unit = match[2] ?? '';
  const units: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (units[unit] ?? 60_000);
};

export const getCookieOptions = (secure: boolean, maxAgeMs: number): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
  maxAge: maxAgeMs,
});