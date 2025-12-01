import pino, { Logger as PinoLogger, TransportMultiOptions } from 'pino';
import { applicationConfig } from './config';
import { join } from 'path';

export class Logger {
  private logger: PinoLogger;

  constructor(private context: string) {
    const logLevel = applicationConfig.server.environment == 'development' ? 'debug' : 'info';

    const transports: TransportMultiOptions = {
      targets: [
        // ===== Target 1: Pretty logs in console =====
        {
          target: 'pino-pretty',
          level: logLevel,
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },

        // ===== Target 2: Daily rotating file logs =====
        {
          target: 'pino-roll',
          options: {
            file: join('logs', 'log'),
            frequency: 'daily',
            mkdir: true,
            base: {
              context: this.context,
            },
            level: logLevel,
          },
        },
      ],
    };

    const transport = pino.transport(transports);
    this.logger = pino(transport);
  }

  private meta(meta?: any) {
    return { context: this.context, ...(meta ?? {}) };
  }

  info(message: string, meta?: any) {
    this.logger.info(this.meta(meta), message);
  }

  error(message: string, meta?: any) {
    this.logger.error(this.meta(meta), message);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(this.meta(meta), message);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(this.meta(meta), message);
  }
}
