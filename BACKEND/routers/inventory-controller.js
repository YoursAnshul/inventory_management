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


exports.addInventory = (req, res) => {
    const { name, category_id, qty, price } = req.body;

    const checkQuery = `SELECT id FROM inventory WHERE name = ? AND category_id = ?`;
    connection.db.execute(checkQuery, [name, category_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Duplicate inventory entry' });
        }

        const insertQuery = `INSERT INTO inventory (name, category_id, qty, price, status) VALUES (?, ?, ?, ?, 'ACTIVE')`;
        connection.db.execute(insertQuery, [name, category_id, qty, price], (err, insertResults) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            const inventory_id = insertResults.insertId;
            const transactionQuery = `INSERT INTO inventory_transactions (inventory_id, type, qty, price) VALUES (?, 'IN', ?, ?)`;
            connection.db.execute(transactionQuery, [inventory_id, qty, price], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Transaction logging error' });
                }
                res.status(201).json({ success: true, message: 'Inventory added and logged' });
            });
        });
    });
};


exports.updateInventory = (req, res) => {
    const { id, qty, customer_id } = req.body;

    const checkQuery = `SELECT qty FROM inventory WHERE id = ?`;
    connection.db.execute(checkQuery, [id], (err, results) => {
        if (err || results.length === 0 || results[0].qty < qty) {
            return res.status(400).json({ success: false, message: 'Insufficient inventory' });
        }

        const updateQuery = `UPDATE inventory SET qty = qty - ? WHERE id = ?`;
        connection.db.execute(updateQuery, [qty, id], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Update error' });
            }

            const transactionQuery = `INSERT INTO inventory_transactions (inventory_id, type, qty, customer_id) VALUES (?, 'OUT', ?, ?)`;
            connection.db.execute(transactionQuery, [id, qty, customer_id], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Transaction logging error' });
                }
                res.status(200).json({ success: true, message: 'Inventory updated and logged' });
            });
        });
    });
};


exports.getInventory = (req, res) => {
    const query = `SELECT i.id, i.name, i.qty, i.price, c.name as category
                   FROM inventory i
                   JOIN categories c ON i.category_id = c.id
                   WHERE i.status = 'ACTIVE'`;

    connection.db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        res.status(200).json({ success: true, data: results });
    });
};


exports.getInventoryTransactions = (req, res) => {
    const { type } = req.query; 

    const query = `SELECT it.id, i.name as inventory_name, it.type, it.qty, it.price, c.name as customer_name, it.created_at
                   FROM inventory_transactions it
                   JOIN inventory i ON it.inventory_id = i.id
                   LEFT JOIN customers c ON it.customer_id = c.id
                   WHERE it.type = ?`;

    connection.db.execute(query, [type], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        res.status(200).json({ success: true, data: results });
    });
};