// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const [cat] = await db.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    if (!cat.length) return res.status(404).send('Category not found');
    const [products] = await db.query('SELECT id, name, slug, price, image FROM products WHERE category_id = ?', [cat[0].id]);
    res.render('category', { products, categoryName: cat[0].name, title: cat[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

module.exports = router;
