import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { CustomerData } from './entity/CustomerData.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [CustomerData],
  migrations: ['./src/migrations/**/*.ts'],
  subscribers: [],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});
