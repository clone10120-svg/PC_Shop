// routes/admin/products.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../../config/db');
const isAdmin = require('../../middleware/isAdmin');

// cấu hình multer (lưu vào uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'-'))
});
const upload = multer({ storage });

// List products
router.get('/', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.*, c.name AS category_name 
                                   FROM products p LEFT JOIN categories c ON p.category_id=c.id
                                   ORDER BY p.id DESC`);
    res.render('admin/products', { products: rows, title: 'Quản lý sản phẩm' });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi lấy sản phẩm');
    res.redirect('/');
  }
});

// Show add form
router.get('/add', isAdmin, async (req, res) => {
  const [cats] = await db.query('SELECT * FROM categories');
  res.render('admin/product_form', { product: null, categories: cats, title: 'Thêm sản phẩm' });
});

// Create
router.post('/add', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, slug, price, description, category_id, stock } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;
    const s = slug && slug.trim() ? slug.trim() : name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g,'');
    await db.query('INSERT INTO products (name, slug, price, description, category_id, stock, image) VALUES (?,?,?,?,?,?,?)',
      [name, s, price || 0, description || '', category_id || null, stock || 0, image]);
    req.flash('success', 'Thêm sản phẩm thành công');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi tạo sản phẩm');
    res.redirect('/admin/products');
  }
});

// Show edit form
router.get('/edit/:id', isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows.length) return res.redirect('/admin/products');
    const [cats] = await db.query('SELECT * FROM categories');
    res.render('admin/product_form', { product: rows[0], categories: cats, title: 'Sửa sản phẩm' });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi tải sản phẩm');
    res.redirect('/admin/products');
  }
});

// Update
router.post('/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, slug, price, description, category_id, stock, old_image } = req.body;
    let image = old_image || null;
    if (req.file) image = '/uploads/' + req.file.filename;

    const s = slug && slug.trim() ? slug.trim() : name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g,'');
    await db.query('UPDATE products SET name=?, slug=?, price=?, description=?, category_id=?, stock=?, image=? WHERE id=?',
      [name, s, price || 0, description || '', category_id || null, stock || 0, image, id]);
    req.flash('success', 'Cập nhật sản phẩm thành công');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi cập nhật sản phẩm');
    res.redirect('/admin/products');
  }
});

// Delete
router.get('/delete/:id', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    req.flash('success', 'Xóa sản phẩm thành công');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Lỗi xóa sản phẩm');
    res.redirect('/admin/products');
  }
});

module.exports = router;
