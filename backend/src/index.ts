import app from './app';
import dotenv from 'dotenv';
import { pool } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('Database connected successfully');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
