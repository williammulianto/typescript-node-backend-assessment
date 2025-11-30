import { Bootstrap } from '../application';
import config from '../../mikro-orm.config';
import { Database } from './db';

export async function initTestApp() {
  // Use local memory for easier testing
  const db = await Database.init({
    ...config,
    debug: false,
    dbName: ':memory:',
  });

  await db.orm.schema.createSchema();

  const TEST_PORT = 5000;
  const bootstrap = new Bootstrap(db, TEST_PORT);
  bootstrap.init();

  return { app: bootstrap.getApp(), db: db };
}
