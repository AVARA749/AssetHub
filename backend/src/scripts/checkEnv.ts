import dotenv from 'dotenv';
dotenv.config();

console.log('ENV STATUS:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'UNDEFINED');
console.log('DB_SSL:', process.env.DB_SSL);
console.log('CWD:', process.cwd());
