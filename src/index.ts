import { Database } from 'utils/db';
import { Bootstrap } from './application';
import config from '../mikro-orm.config';
import { applicationConfig } from 'utils/config';

async function start() {
  try {
    const db = await Database.init(config);
    const port = applicationConfig.server.port;
    const bootstrap = new Bootstrap(db, port);
    bootstrap.init();
    bootstrap.start();
  } catch (e) {
    console.error(e);
  }
}

start();
