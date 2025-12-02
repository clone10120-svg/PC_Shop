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
    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, 'user']);
    req.flash('success', 'Đăng ký thành công, mời đăng nhập');
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
      req.flash('error', 'Sai username hoặc password');
      return res.redirect('/auth/login');
    }
    const user = rows[0];

    // Thử bcrypt first (nếu pass đã được hash), nếu không match và giá trị trong DB không bắt đầu bằng $2 thì thử so sánh plaintext
    let match = false;
    if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password;
    }

    if (!match) {
      req.flash('error', 'Sai username hoặc password');
      return res.redirect('/auth/login');
    }

    // Lưu session - chỉ lưu giá trị cần thiết
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    req.flash('success', 'Đăng nhập thành công');
    // Nếu admin chuyển hướng tới admin dashboard
    if (user.role === 1 || user.role === '1' || user.role === 'admin') {
      return res.redirect('/admin/products');
    }
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Lỗi server');
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
