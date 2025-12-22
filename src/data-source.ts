import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CustomerData } from './entity/CustomerData.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: "intellicallserver.database.windows.net", // Add in KeyVault later
  port: 1433,
  username: "intellicall414", // Add in KeyVault later
  password: "Counterlogic1!", // Add in KeyVault later
  database: "intellicalldatabase", // Add in KeyVault later
  // synchronize: true,
  logging: true,
  logger: "file",
  entities: [CustomerData],
  migrations: ['./dist/migrations/**/*.js'],
  subscribers: [],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});
