exports.postLogin = (req, res) => {
    const { username, password } = req.body;

    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.query(sql, [username, password], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.render("login", { error: "Sai tài khoản hoặc mật khẩu" });
        }

        const user = results[0];

        // Lưu session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role  // 1 = admin
        };

        // Nếu admin → vào trang quản trị
        if (user.role === 1) {
            return res.redirect("/admin");
        }

        // Nếu user thường → về trang chủ
        res.redirect("/");
    });
};
