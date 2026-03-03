import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { pool } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const initDb = async () => {
    try {
        console.log('🔄 Initializing AssetHub Database Synchronization...');

        const dbName = process.env.DB_NAME || 'assethub';

        // 1. First, connect to 'postgres' to ensure the target DB exists
        const client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: 'postgres'
        });

        await client.connect();
        const checkDb = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (checkDb.rowCount === 0) {
            console.log(`🏗️ Creating missing database: ${dbName}...`);
            await client.query(`CREATE DATABASE ${dbName}`);
        }
        await client.end();

        // 2. Now run the schema on the target pool
        const sqlPath = path.join(__dirname, '../../scripts/setup_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);

        console.log('✅ Database Schema & Initial Seed Synchronized Successfully!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Database Initialization Failed:');
        console.error(error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\nTIP: Ensure PostgreSQL is running and credentials in backend/.env are correct.');
        } else if (error.code === '3D000') {
            console.error('\nTIP: The database specified in DB_NAME does not exist. Please create it first in PostgreSQL.');
        }

        process.exit(1);
    }
};

initDb();
