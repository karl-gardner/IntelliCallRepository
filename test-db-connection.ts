import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import path from 'path';

dotenv.config();

// Use SQLite for testing
const useSQLite = process.env.DB_TYPE !== 'mssql';

const testDataSource = new DataSource(
  useSQLite
    ? {
        type: 'better-sqlite3',
        database: process.env.DB_DATABASE || path.join(__dirname, '../data/intellicall.db'),
      }
    : {
        type: 'mssql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '1433'),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      }
);

async function testConnection() {
  console.log('Testing database connection...');
  if (useSQLite) {
    console.log('Using SQLite (temporary database)');
    console.log(`  Database file: ${process.env.DB_DATABASE || path.join(__dirname, '../data/intellicall.db')}`);
  } else {
    console.log('Using SQL Server');
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  Port: ${process.env.DB_PORT || '1433'}`);
    console.log(`  Database: ${process.env.DB_DATABASE || 'IntelliCallDB'}`);
    console.log(`  Username: ${process.env.DB_USERNAME || 'not set'}`);
    console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : 'not set'}`);
  }
  console.log('');

  try {
    await testDataSource.initialize();
    console.log('✓ Database connection successful!');
    console.log('✓ Database is set up and accessible');
    
    // Try to query the customers table to see if it exists
    try {
      const result = await testDataSource.query('SELECT COUNT(*) as count FROM customers');
      console.log(`✓ Found ${result[0]?.count || 0} customers in database`);
    } catch (tableError: any) {
      if (tableError.message.includes('Invalid object name')) {
        console.log('⚠ Customers table does not exist yet (will be created on first backend start)');
      } else {
        throw tableError;
      }
    }
    
    await testDataSource.destroy();
    console.log('');
    console.log('✓ Database is ready! You can start the backend server.');
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Database connection failed!');
    console.error('');
    console.error('Error details:');
    console.error(error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('Possible issues:');
      console.error('  1. SQL Server is not running');
      console.error('  2. Wrong host/port in .env file');
      console.error('  3. Firewall blocking connection');
      console.error('');
      console.error('To fix: Start SQL Server service');
    } else if (error.message.includes('Login failed') || error.message.includes('authentication')) {
      console.error('Possible issues:');
      console.error('  1. Wrong username/password in .env file');
      console.error('  2. SQL Server authentication not enabled');
      console.error('');
      console.error('To fix: Update DB_USERNAME and DB_PASSWORD in backend/.env');
    } else if (error.message.includes('Cannot open database')) {
      console.error('Possible issues:');
      console.error('  1. Database "IntelliCallDB" does not exist');
      console.error('  2. User does not have access to the database');
      console.error('');
      console.error('To fix: Run this SQL command:');
      console.error('  CREATE DATABASE IntelliCallDB;');
    }
    
    await testDataSource.destroy().catch(() => {});
    process.exit(1);
  }
}

testConnection();

