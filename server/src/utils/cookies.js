const parseDurationToMs = (duration) => {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return 6e4;
  const value = Number(match[1]);
  const unit = match[2] ?? '';
  const units = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
  return value * (units[unit] ?? 6e4);
};
const getCookieOptions = (secure, maxAgeMs) => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
  maxAge: maxAgeMs,
});
export { getCookieOptions, parseDurationToMs };
