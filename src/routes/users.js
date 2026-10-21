const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, phone, email, user_type, verified, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ count: result.rows.length, users: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, phone, email, user_type, verified, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Mtumiaji haipatikani' });
        res.json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, phone, user_type, verified, created_at FROM users WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Mtumiaji haipatikani' });
        res.json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;