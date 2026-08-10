import pino from 'pino';
import { env } from './env.js';

const isProd = env.NODE_ENV === 'production';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
      },
});