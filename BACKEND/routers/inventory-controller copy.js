const connection = require('./db-connection.js');


exports.getCategories = (req, res) => {
    const query = `SELECT id , name  FROM categories where status='ACTIVE'`;

    connection.db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    });
}

exports.getCustomers = (req, res) => {
    const query = `SELECT id , name  FROM customers where status='ACTIVE'`;

    connection.db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    });
}