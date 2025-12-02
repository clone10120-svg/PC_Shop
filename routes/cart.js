// routes/cart.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

function ensureAuth(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Bạn cần đăng nhập');
    return res.redirect('/auth/login');
  }
  next();
}

router.get('/', ensureAuth, async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT c.product_id, c.quantity, p.name, p.price, p.image
      FROM cart_items c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.session.user.id]);
    res.render('cart', { cart: items, title: 'Giỏ hàng' });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

router.post('/add', ensureAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const productId = req.body.product_id;
    // insert or increment
    await db.query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1
    `, [userId, productId]);
    req.flash('success', 'Đã thêm vào giỏ');
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi thêm giỏ');
    res.redirect('back');
  }
});

router.post('/update', ensureAuth, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (quantity <= 0) {
      await db.query('DELETE FROM cart_items WHERE user_id=? AND product_id=?', [req.session.user.id, product_id]);
    } else {
      await db.query('UPDATE cart_items SET quantity=? WHERE user_id=? AND product_id=?', [quantity, req.session.user.id, product_id]);
    }
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.redirect('/cart');
  }
});

module.exports = router;
