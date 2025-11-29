import { Database } from 'utils/db';
import { Bootstrap } from './application';
import config from '../mikro-orm.config';
import { applicationConfig } from 'utils/config';
import { Logger } from 'utils/logger';
import { application } from 'express';

async function start() {
  try {
    const logger = new Logger('Application');
    logger.info('Initialize');
    const db = await Database.init(config);
    const port = applicationConfig.server.port;
    const bootstrap = new Bootstrap(db, port);

    logger.error('try error');
    bootstrap.init();
    bootstrap.start();
  } catch (e) {
    console.error(e);
  }
}

start();
