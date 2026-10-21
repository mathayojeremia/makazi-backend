const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ===== REGISTER =====
router.post('/register', async (req, res) => {
    try {
        const { phone, name, email, password, user_type } = req.body;

        // Validation
        if (!phone || !name || !password) {
            return res.status(400).json({
                error: 'Tafadhali weka phone, name, na password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password lazima iwe herufi 6 au zaidi'
            });
        }

        // Angalia kama phone ipo tayari
        const existing = await pool.query(
            'SELECT id FROM users WHERE phone = $1',
            [phone]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                error: 'Namba hii imesajiliwa tayari'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (phone, name, email, password_hash, user_type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, phone, name, email, user_type, created_at`,
            [phone, name, email || null, password_hash, user_type || 'tenant']
        );

        const user = result.rows[0];

        // Tengeneza JWT token
        const token = jwt.sign(
            { id: user.id, phone: user.phone, user_type: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: '✅ Umefanikiwa kujiandikisha',
            token,
            user
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validation
        if (!phone || !password) {
            return res.status(400).json({
                error: 'Tafadhali weka phone na password'
            });
        }

        // Tafuta user
        const result = await pool.query(
            'SELECT * FROM users WHERE phone = $1',
            [phone]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Namba au password si sahihi'
            });
        }

        const user = result.rows[0];

        // Angalia password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({
                error: 'Namba au password si sahihi'
            });
        }

        // Tengeneza JWT token
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
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

module.exports = router;