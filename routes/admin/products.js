const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { isAdmin } = require('../../middleware/auth');

// Trang danh sách sản phẩm (Admin) const upload = multer({ dest: 'uploads/' });
router.get('/', isAdmin, (req, res) => {
    db.query(`
        SELECT products.*, categories.name AS category_name 
        FROM products 
        LEFT JOIN categories ON products.category_id = categories.id
        ORDER BY products.id DESC
    `, (err, products) => {
        res.render('admin/products/index', { products });
    });
});

// Form thêm sản phẩm
router.get('/add', isAdmin, (req, res) => {
    db.query("SELECT * FROM categories", (err, categories) => {
        res.render('admin/products/add', { categories });
    });
});

// Submit thêm sản phẩm
router.post('/add', isAdmin, (req, res) => {
    const { name, price, discount, description, category_id } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-');

    db.query(
        "INSERT INTO products (name, slug, price, discount, description, category_id) VALUES (?, ?, ?, ?, ?, ?)",
        [name, slug, price, discount, description, category_id],
        () => res.redirect('/admin/products')
    );
});

// Form sửa sản phẩm
router.get('/edit/:id', isAdmin, (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM products WHERE id = ?", [id], (err, product) => {
        db.query("SELECT * FROM categories", (err, categories) => {
            res.render('admin/products/edit', {
                product: product[0],
                categories
            });
        });
    });
});

// Submit sửa
router.post('/edit/:id', isAdmin, (req, res) => {
    const { name, price, discount, description, category_id } = req.body;
    const id = req.params.id;

    db.query(
        "UPDATE products SET name=?, price=?, discount=?, description=?, category_id=? WHERE id=?",
        [name, price, discount, description, category_id, id],
        () => res.redirect('/admin/products')
    );
});

// Xóa sản phẩm
router.get('/delete/:id', isAdmin, (req, res) => {
    db.query("DELETE FROM products WHERE id=?", [req.params.id], () => {
        res.redirect('/admin/products');
    });
});

module.exports = router;
