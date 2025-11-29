import pino, { Logger as PinoLogger, TransportMultiOptions } from 'pino';
import { applicationConfig } from './config';
import { join } from 'path';

export class Logger {
  private logger: PinoLogger;

  constructor(context: string) {
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
              context: context,
            },
            level: logLevel,
          },
        },
      ],
    };

    const transport = pino.transport(transports);
    this.logger = pino(transport);
  }
  debug(message: string, meta?: any) {
    this.logger.debug(meta ?? {}, message);
  }
  info(message: string, meta?: any) {
    this.logger.info(meta ?? {}, message);
  }
  warn(message: string, meta?: any) {
    this.logger.warn(meta ?? {}, message);
  }
  error(message: string, meta?: any) {
    this.logger.error(meta ?? {}, message);
  }
}
