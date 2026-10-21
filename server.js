const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const authRoutes = require('./routes/auth');
const houseRoutes = require('./routes/houses');
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);

// Test database
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: '✅ Database inafanya kazi',
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Database haifanyi kazi',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: '🏠 MAKAZI TZ API',
        version: '1.0.0',
        status: 'Inafanya kazi',
        time: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server inafanya kazi' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Kuna kosa kwenye server' });
});

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`🚀 Server inafanya kazi kwenye port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log('🚀 ================================');
    console.log('');
});