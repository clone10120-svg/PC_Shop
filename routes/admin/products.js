const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const pool = require("../../config/db");
const { isAdmin } = require("../../middleware/auth");

// GET: admin list products
router.get("/", isAdmin, async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.render("admin/products", { products: rows });
});

// GET: create form
router.get("/create", isAdmin, (req, res) => {
    res.render("admin/product_form", { product: null });
});

// POST: create product
router.post("/create", isAdmin, upload.single("image"), async (req, res) => {
    const { name, price, category_id } = req.body;
    const image = req.file ? req.file.filename : null;

    await pool.query(
        "INSERT INTO products (name, price, category_id, image) VALUES (?, ?, ?, ?)",
        [name, price, category_id, image]
    );

    res.redirect("/admin/products");
});

// GET: edit
router.get("/edit/:id", isAdmin, async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
        req.params.id
    ]);

    res.render("admin/product_form", { product: rows[0] });
});

// POST: update
router.post("/edit/:id", isAdmin, upload.single("image"), async (req, res) => {
    const { name, price, category_id } = req.body;
    let image = req.body.old_image;

    if (req.file) {
        image = req.file.filename;
    }

    await pool.query(
        "UPDATE products SET name=?, price=?, category_id=?, image=? WHERE id=?",
        [name, price, category_id, image, req.params.id]
    );

    res.redirect("/admin/products");
});

// DELETE
router.get("/delete/:id", isAdmin, async (req, res) => {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.redirect("/admin/products");
});

module.exports = router;
