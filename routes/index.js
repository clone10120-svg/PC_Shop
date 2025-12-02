// routes/index.js
// Thêm route admin vào app.js hoặc index.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [products] = await db.query('SELECT id, name, slug, price, image FROM products ORDER BY created_at DESC LIMIT 12');
    res.render('index', { products, title: 'Trang chủ' });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

module.exports = router;
