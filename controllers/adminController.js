const db = require('../config/db');

exports.dashboard = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .query('SELECT * FROM products ORDER BY created_at DESC');
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard - Quản lý sản phẩm',
            products: result.recordset
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        req.flash('error', 'Không thể tải trang quản lý');
        res.redirect('/');
    }
};

exports.editProduct = async (req, res) => {
    try {
        const pool = await db;
        const result = await pool.request()
            .input('id', req.params.id)
            .query('SELECT * FROM products WHERE id = @id');
        
        if (result.recordset.length === 0) {
            req.flash('error', 'Sản phẩm không tồn tại');
            return res.redirect('/admin/dashboard');
        }
        
        res.render('admin/edit-product', {
            title: 'Chỉnh sửa sản phẩm',
            product: result.recordset[0]
        });
    } catch (error) {
        console.error('Edit product error:', error);
        req.flash('error', 'Không thể tải trang chỉnh sửa');
        res.redirect('/admin/dashboard');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;
        
        const pool = await db;
        await pool.request()
            .input('id', id)
            .input('name', name)
            .input('description', description)
            .input('price', price)
            .input('category', category)
            .input('stock', stock)
            .query(`
                UPDATE products 
                SET name = @name, 
                    description = @description, 
                    price = @price, 
                    category = @category, 
                    stock = @stock,
                    updated_at = GETDATE()
                WHERE id = @id
            `);
        
        req.flash('success', 'Cập nhật sản phẩm thành công');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Update product error:', error);
        req.flash('error', 'Không thể cập nhật sản phẩm');
        res.redirect(`/admin/products/edit/${req.params.id}`);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const pool = await db;
        await pool.request()
            .input('id', req.params.id)
            .query('DELETE FROM products WHERE id = @id');
        
        req.flash('success', 'Xóa sản phẩm thành công');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Delete product error:', error);
        req.flash('error', 'Không thể xóa sản phẩm');
        res.redirect('/admin/dashboard');
    }
};

exports.addProductForm = (req, res) => {
    res.render('admin/add-product', {
        title: 'Thêm sản phẩm mới'
    });
};

exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        
        const pool = await db;
        await pool.request()
            .input('name', name)
            .input('description', description)
            .input('price', price)
            .input('category', category)
            .input('stock', stock)
            .input('image_url', '/img/placeholder.png') // Hoặc xử lý upload ảnh
            .query(`
                INSERT INTO products (name, description, price, category, stock, image_url, created_at)
                VALUES (@name, @description, @price, @category, @stock, @image_url, GETDATE())
            `);
        
        req.flash('success', 'Thêm sản phẩm thành công');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Add product error:', error);
        req.flash('error', 'Không thể thêm sản phẩm');
        res.redirect('/admin/products/add');
    }
};