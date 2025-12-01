import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { applicationConfig } from './src/utils/config';
import { Project } from 'entities/Project';
import { Task } from 'entities/Task';

export default defineConfig({
  dbName: applicationConfig.database.dbName,
  // https://github.com/mikro-orm/express-ts-example-app/blob/master/app/mikro-orm.config.ts
  // https://github.com/mikro-orm/mikro-orm/discussions/5804#discussioncomment-10024728
  // Not recommend using path as compiler can be tricky.
  entities: [Project, Task],
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  // for vitest to get around `TypeError: Unknown file extension ".ts"` (ERR_UNKNOWN_FILE_EXTENSION)
  dynamicImportProvider: (id) => import(id),
  debug: true,
  metadataProvider: TsMorphMetadataProvider,
});
