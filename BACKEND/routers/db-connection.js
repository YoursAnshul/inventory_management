const mysql = require('mysql2');
exports.db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'inventory_management'
});
