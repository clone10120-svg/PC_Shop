// middleware/isAdmin.js
module.exports = function isAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    req.flash('error', 'Bạn cần đăng nhập');
    return res.redirect('/auth/login');
  }
  const role = req.session.user.role;
  // chấp nhận cả dạng số (1) và chữ ('admin') và chuỗi '1'
  if (role === 1 || role === '1' || role === 'admin' || role === 'Admin') {
    return next();
  }
  req.flash('error', 'Bạn không đủ quyền');
  return res.redirect('/');
};
