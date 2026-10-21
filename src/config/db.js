const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME || 'makazi_tz',
});

pool.on('connect', () => {
    console.log('✅ Database imeunganishwa');
});

pool.on('error', (err) => {
    console.error('❌ Database error:', err);
});

module.exports = pool;