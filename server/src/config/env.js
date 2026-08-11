import dotenv from 'dotenv';
dotenv.config();
function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === void 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4e3),
  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? 'false') === 'true',
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
const isTest = env.NODE_ENV === 'test';
const isProd = env.NODE_ENV === 'production';
export { env, isProd, isTest };
