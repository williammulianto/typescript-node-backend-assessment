import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { applicationConfig } from './src/utils/config';

export default defineConfig({
  dbName: applicationConfig.database.dbName,
  entities: ['./dist/entities'],
  entitiesTs: ['./src/entities'],
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
