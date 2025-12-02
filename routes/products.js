// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const [rows] = await db.query('SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.slug = ?', [slug]);
    if (!rows.length) return res.status(404).send('Không tìm thấy sản phẩm');
    res.render('product', { product: rows[0], title: rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

module.exports = router;
