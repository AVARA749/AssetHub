import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const initDb = async () => {
    try {
        console.log('🔄 Initializing AssetHub Database Synchronization...');

        // Read the SQL file
        const sqlPath = path.join(__dirname, '../../scripts/setup_db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to execute multiple statements if needed, 
        // though pool.query can often handle multiple statements depending on config.
        // For robustness with the pg driver, we'll execute the whole block.
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
