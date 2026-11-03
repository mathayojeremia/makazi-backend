const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 10000;

// ===== CORS CONFIG — RUHUSU NETLIFY =====
const allowedOrigins = [
    'https://makazi-t.netlify.app',
    'https://mellifluous-biscuit-d4eddf.netlify.app',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400
}));

// ===== PREFLIGHT HANDLER — MUHIMU! =====
app.options('*', cors());

// ===== BODY PARSER =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const houseRoutes = require('./routes/houses');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ===== TEST DATABASE =====
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

// ===== ROOT =====
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

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server inafanya kazi' });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({
        error: 'Route haipo',
        path: req.originalUrl
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS: Origin hairuhusiwi' });
    }
    res.status(500).json({ error: 'Kuna kosa kwenye server' });
});

// ===== START SERVER =====
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
    console.log('✅ CORS imeruhusu:');
    allowedOrigins.forEach(o => console.log('   • ' + o));
    console.log('');
});