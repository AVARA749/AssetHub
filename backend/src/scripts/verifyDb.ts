import { pool } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('🔍 Testing PostgreSQL Connection...');
        const res = await pool.query('SELECT NOW(), current_database(), current_user');
        console.log('✅ Connection Successful!');
        console.log('📊 Stats:', res.rows[0]);

        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('📋 Existing Tables:', tables.rows.map(t => t.table_name).join(', '));

        process.exit(0);
    } catch (err: any) {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    }
};

testConnection();
