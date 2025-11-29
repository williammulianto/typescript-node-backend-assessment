import dotenv from 'dotenv';
dotenv.config();

interface ApplicationConfig {
  database: {
    username: string;
    password: string;
    dbName: string;
  };
  server: {
    port: number;
    environment: string;
  };
}

export const applicationConfig: ApplicationConfig = {
  database: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
  },
  server: {
    port: Number(process.env.PORT),
    environment: process.env.NODE_ENV,
  },
};
