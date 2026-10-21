const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// ===== GET ALL HOUSES (Public) =====
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT h.*, u.name as owner_name, u.phone as owner_phone
             FROM houses h
             LEFT JOIN users u ON h.owner_id = u.id
             ORDER BY h.created_at DESC`
        );

        res.json({
            count: result.rows.length,
            houses: result.rows
        });

    } catch (error) {
        console.error('Get houses error:', error);
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

// ===== GET ONE HOUSE (Public) =====
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT h.*, u.name as owner_name, u.phone as owner_phone
             FROM houses h
             LEFT JOIN users u ON h.owner_id = u.id
             WHERE h.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Nyumba haipatikani'
            });
        }

        // Ongeza views
        await pool.query(
            'UPDATE houses SET views = views + 1 WHERE id = $1',
            [id]
        );

        res.json({ house: result.rows[0] });

    } catch (error) {
        console.error('Get house error:', error);
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

// ===== CREATE HOUSE (Protected) =====
router.post('/', auth, async (req, res) => {
    try {
        const {
            title, description, area, city, price,
            bedrooms, bathrooms, parking, size,
            amenities, images
        } = req.body;

        // Validation
        if (!title || !area || !city || !price) {
            return res.status(400).json({
                error: 'Tafadhali weka title, area, city, na price'
            });
        }

        const result = await pool.query(
            `INSERT INTO houses 
             (title, description, area, city, price, bedrooms, bathrooms, 
              parking, size, amenities, images, owner_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                title,
                description || null,
                area,
                city,
                price,
                bedrooms || 1,
                bathrooms || 1,
                parking || 0,
                size || 0,
                amenities || [],
                images || [],
                req.user.id
            ]
        );

        res.status(201).json({
            message: '✅ Nyumba imeongezwa',
            house: result.rows[0]
        });

    } catch (error) {
        console.error('Create house error:', error);
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

// ===== UPDATE HOUSE (Protected) =====
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query(
            'SELECT owner_id FROM houses WHERE id = $1',
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Nyumba haipatikani' });
        }

        if (check.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({
                error: 'Huna ruhusa kubadilisha nyumba hii'
            });
        }

        const {
            title, description, area, city, price,
            bedrooms, bathrooms, parking, size,
            amenities, images
        } = req.body;

        const result = await pool.query(
            `UPDATE houses SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                area = COALESCE($3, area),
                city = COALESCE($4, city),
                price = COALESCE($5, price),
                bedrooms = COALESCE($6, bedrooms),
                bathrooms = COALESCE($7, bathrooms),
                parking = COALESCE($8, parking),
                size = COALESCE($9, size),
                amenities = COALESCE($10, amenities),
                images = COALESCE($11, images)
             WHERE id = $12
             RETURNING *`,
            [
                title, description, area, city, price,
                bedrooms, bathrooms, parking, size,
                amenities, images, id
            ]
        );

        res.json({
            message: '✅ Nyumba imebadilishwa',
            house: result.rows[0]
        });

    } catch (error) {
        console.error('Update house error:', error);
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

// ===== DELETE HOUSE (Protected) =====
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query(
            'SELECT owner_id FROM houses WHERE id = $1',
            [id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Nyumba haipatikani' });
        }

        if (check.rows[0].owner_id !== req.user.id) {
            return res.status(403).json({
                error: 'Huna ruhusa kufuta nyumba hii'
            });
        }

        await pool.query('DELETE FROM houses WHERE id = $1', [id]);

        res.json({ message: '✅ Nyumba imefutwa' });

    } catch (error) {
        console.error('Delete house error:', error);
        res.status(500).json({
            error: 'Kuna kosa kwenye server',
            details: error.message
        });
    }
});

module.exports = router;