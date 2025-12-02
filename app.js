// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');

const app = express();

// view
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// static
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// routes
app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/category', categoriesRouter);
app.use('/auth', authRouter);
app.use('/cart', cartRouter);

// 404
app.use((req, res) => res.status(404).render('404', { title: '404' }));

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => console.log(`Server started: http://localhost:${PORT}`));

const adminProductRouter = require('./routes/admin/products');
app.use('/admin/products', adminProductRouter);
app.use('/admin/products', require('./routes/admin/products'));

// sau khi đã khai báo express, session, flash, layouts...
app.use('/auth', require('./routes/auth'));
app.use('/admin/products', require('./routes/admin/products'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
