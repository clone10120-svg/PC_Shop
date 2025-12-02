// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

router.get('/login', (req, res) => res.render('auth/login', { title: 'Login' }));
router.get('/register', (req, res) => res.render('auth/register', { title: 'Register' }));

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      req.flash('error', 'Thiếu username hoặc password');
      return res.redirect('/auth/register');
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?,?)', [username, hash]);
    req.flash('success', 'Đăng ký thành công, đăng nhập thôi');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi hoặc username đã tồn tại');
    res.redirect('/auth/register');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) {
      req.flash('error', 'Sai tài khoản hoặc mật khẩu');
      return res.redirect('/auth/login');
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash('error', 'Sai tài khoản hoặc mật khẩu');
      return res.redirect('/auth/login');
    }
    req.session.user = { id: user.id, username: user.username, role: user.role };
    req.flash('success', 'Đăng nhập thành công');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi server');
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
