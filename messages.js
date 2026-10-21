const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET conversations
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT DISTINCT
                CASE 
                    WHEN sender_id = $1 THEN receiver_id
                    ELSE sender_id
                END as other_user_id
             FROM messages
             WHERE sender_id = $1 OR receiver_id = $1`,
            [userId]
        );

        const conversations = [];

        for (const row of result.rows) {
            const otherId = row.other_user_id;

            const userResult = await pool.query(
                'SELECT id, name, user_type FROM users WHERE id = $1',
                [otherId]
            );

            if (userResult.rows.length === 0) continue;
            const otherUser = userResult.rows[0];

            const lastMsgResult = await pool.query(
                `SELECT message, created_at FROM messages
                 WHERE (sender_id = $1 AND receiver_id = $2)
                    OR (sender_id = $2 AND receiver_id = $1)
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, otherId]
            );

            const unreadResult = await pool.query(
                `SELECT COUNT(*) as count FROM messages
                 WHERE sender_id = $1 AND receiver_id = $2 AND read = false`,
                [otherId, userId]
            );

            conversations.push({
                user_id: otherUser.id,
                name: otherUser.name,
                user_type: otherUser.user_type,
                last_message: lastMsgResult.rows[0]?.message || '',
                last_time: lastMsgResult.rows[0]?.created_at || null,
                unread: parseInt(unreadResult.rows[0].count)
            });
        }

        conversations.sort((a, b) => {
            if (!a.last_time) return 1;
            if (!b.last_time) return -1;
            return new Date(b.last_time) - new Date(a.last_time);
        });

        res.json({ conversations });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET messages with one user
router.get('/:userId', auth, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = req.params.userId;

        const result = await pool.query(
            `SELECT m.*, s.name as sender_name
             FROM messages m
             LEFT JOIN users s ON m.sender_id = s.id
             WHERE (m.sender_id = $1 AND m.receiver_id = $2)
                OR (m.sender_id = $2 AND m.receiver_id = $1)
             ORDER BY m.created_at ASC`,
            [myId, otherId]
        );

        await pool.query(
            `UPDATE messages SET read = true
             WHERE sender_id = $1 AND receiver_id = $2 AND read = false`,
            [otherId, myId]
        );

        res.json({ messages: result.rows });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SEND message
router.post('/', auth, async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiver_id, message, house_id } = req.body;

        if (!receiver_id || !message) {
            return res.status(400).json({ error: 'Weka receiver_id na message' });
        }

        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, house_id, message, read)
             VALUES ($1, $2, $3, $4, false)
             RETURNING *`,
            [senderId, receiver_id, house_id || null, message.trim()]
        );

        res.status(201).json({
            message: '✅ Ujumbe umetumwa',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;