import pino from 'pino';
import { env } from './env.js';
const isProd = env.NODE_ENV === 'production';
const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: isProd
    ? void 0
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
});
export { logger };
