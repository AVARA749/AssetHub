import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function clearData() {
    try {
        console.log('🗑️  Clearing all data from database...\n');

        // Clear in order respecting foreign key constraints
        const mediaResult = await pool.query('DELETE FROM media');
        console.log(`   ✅ Media:      ${mediaResult.rowCount} records deleted`);

        const paymentsResult = await pool.query('DELETE FROM payments');
        console.log(`   ✅ Payments:   ${paymentsResult.rowCount} records deleted`);

        const propertiesResult = await pool.query('DELETE FROM properties');
        console.log(`   ✅ Properties: ${propertiesResult.rowCount} records deleted`);

        const usersResult = await pool.query('DELETE FROM users');
        console.log(`   ✅ Users:      ${usersResult.rowCount} records deleted`);

        console.log('\n🎉 All data cleared successfully! Database is now empty.');
        console.log('   You can set up a fresh admin via admin.html.\n');
    } catch (err: any) {
        console.error('❌ Error clearing data:', err.message);
    } finally {
        await pool.end();
    }
}

clearData();
