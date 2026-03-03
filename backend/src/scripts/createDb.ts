import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres' // Connect to default db
    });

    try {
        await client.connect();
        console.log('🔗 Connected to Postgres system database...');

        const dbName = process.env.DB_NAME || 'assethub';

        // Check if DB exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`🏗️ Creating database "${dbName}"...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database "${dbName}" created successfully!`);
        } else {
            console.log(`ℹ️ Database "${dbName}" already exists.`);
        }
    } catch (err: any) {
        console.error('❌ Error creating database:', err.message);
    } finally {
        await client.end();
    }
};

createDatabase();
