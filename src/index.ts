import { Database } from 'utils/db';
import { Bootstrap } from './application';
import config from '../mikro-orm.config';
import { applicationConfig } from 'utils/config';
import { Logger } from 'utils/logger';
import 'reflect-metadata';

async function start() {
  try {
    const logger = new Logger('Application');
    logger.info('Initialize Application..');
    const db = await Database.init(config);
    const port = applicationConfig.server.port;
    const bootstrap = new Bootstrap(db, port);

    bootstrap.init();
    bootstrap.start();
    logger.info(`Starting app on port:${port}`);
  } catch (e) {
    console.error(e);
  }
}

start();
