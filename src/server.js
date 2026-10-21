const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const authRoutes = require('./routes/auth');
const houseRoutes = require('./routes/houses');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: '✅ Database inafanya kazi', time: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ message: '❌ Database haifanyi kazi', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: '🏠 MAKAZI TZ API',
        version: '1.0.0',
        status: 'Inafanya kazi',
        time: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            houses: '/api/houses',
            users: '/api/users',
            messages: '/api/messages'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server inafanya kazi' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route haipo', path: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Kuna kosa kwenye server' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`🚀 Server inafanya kazi kwenye port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log('🚀 ================================');
    console.log('');
    console.log('📋 Routes:');
    console.log('   • /api/auth');
    console.log('   • /api/houses');
    console.log('   • /api/users');
    console.log('   • /api/messages');
    console.log('');
});