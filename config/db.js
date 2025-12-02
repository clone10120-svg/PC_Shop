const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3399,
    database: 'pc_shop'
});

db.connect(err => {
    if (err) console.log('Error MySQL:', err);
    else console.log('MySQL connected!');
});

module.exports = db;
