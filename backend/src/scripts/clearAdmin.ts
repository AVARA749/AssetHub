import { pool } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const clearAdmin = async () => {
    try {
        console.log('🧹 Clearing Administrator Credentials...');
        const res = await pool.query("DELETE FROM users WHERE role = 'admin'");
        console.log(`✅ Success: ${res.rowCount} admin account(s) removed.`);
        console.log('🔄 The system is now ready for a fresh "Initial Setup".');
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Failed to clear admin:', err.message);
        process.exit(1);
    }
};

clearAdmin();
