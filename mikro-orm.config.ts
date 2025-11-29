import { defineConfig } from '@mikro-orm/sqlite';
import { applicationConfig } from './src/utils/config.ts';

export default defineConfig({
  dbName: applicationConfig.database.dbName,
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  debug: true,
});
