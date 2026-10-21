const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

router.post('/register', async (req, res) => {
    try {
        const { phone, name, email, password, user_type } = req.body;

        if (!phone || !name || !password) {
            return res.status(400).json({ error: 'Tafadhali weka phone, name, na password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password lazima iwe herufi 6 au zaidi' });
        }

        const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Namba hii imesajiliwa tayari' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO users (phone, name, email, password_hash, user_type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, phone, name, email, user_type, created_at`,
            [phone, name, email || null, password_hash, user_type || 'tenant']
        );

        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, phone: user.phone, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({ message: '✅ Umefanikiwa kujiandikisha', token, user });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Tafadhali weka phone na password' });
        }

        const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Namba au password si sahihi' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Namba au password si sahihi' });
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: '✅ Umeingia kikamilifu',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;