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
    const { name, category_id, qty, price, customer_id } = req.body;

    if (!name || !category_id || !qty) {
        return res.status(400).json({ success: false, message: 'Name, Category, and Quantity are required' });
    }

    const checkDuplicateQuery = `SELECT id FROM inventory WHERE name = ? AND category_id = ? AND status = 'ACTIVE'`;
    connection.db.execute(checkDuplicateQuery, [name, category_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Inventory with this name and category already exists' });
        }

        const insertInventoryQuery = `INSERT INTO inventory (name, category_id, qty, price, status) VALUES (?, ?, ?, ?, 'ACTIVE')`;
        connection.db.execute(insertInventoryQuery, [name, category_id, qty, price], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error adding inventory' });
            }
            res.status(201).json({ success: true, message: 'Inventory added successfully' });
        });
    });
};


exports.updateInventory = (req, res) => {
    const { inventoryId } = req.params;
    const { name, category_id, qty, price, status } = req.body;

    const updateQuery = `UPDATE inventory SET name = ?, category_id = ?, qty = ?, price = ?, status = ? WHERE id = ?`;
    connection.db.execute(updateQuery, [name, category_id, qty, price, status, inventoryId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, message: 'Inventory updated successfully' });
    });
};


exports.deleteInventory = (req, res) => {
    const { inventoryId } = req.params;

    const deleteQuery = `UPDATE inventory SET status = 'DELETED' WHERE id = ?`;
    connection.db.execute(deleteQuery, [inventoryId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, message: 'Inventory deleted successfully' });
    });
};



exports.listInventory = (req, res) => {
    let { page, keyword, date_from, date_to } = req.query;
    const limit = 10;
    page = page ? parseInt(page, 10) : 1;

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page value' });
    }

    const offset = (page - 1) * limit;
    let query = `SELECT id, name, category_id, qty, price, status, created_at, updated_at FROM inventory WHERE status = 'ACTIVE'`;
    let queryParams = [];

    if (keyword) {
        query += ` AND name LIKE ?`;
        queryParams.push(`%${keyword}%`);
    }
    if (date_from) {
        query += ` AND created_at >= ?`;
        queryParams.push(date_from);
    }
    if (date_to) {
        query += ` AND created_at <= ?`;
        queryParams.push(date_to);
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    connection.db.execute(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        res.status(200).json({ success: true, data: results });
    });
};



exports.inventoryTransaction = (req, res) => {
    const { inventory_id, type, qty, customer_id } = req.body;

    if (!inventory_id || !type || !qty || (type !== 'IN' && type !== 'OUT')) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const checkInventoryQuery = `SELECT id, qty FROM inventory WHERE id = ? AND status = 'ACTIVE'`;
    connection.db.execute(checkInventoryQuery, [inventory_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        const currentQty = results[0].qty;
        const newQty = type === 'IN' ? currentQty + qty : currentQty - qty;

        if (newQty < 0) {
            return res.status(400).json({ success: false, message: 'Insufficient quantity for OUT transaction' });
        }

        const updateQtyQuery = `UPDATE inventory SET qty = ? WHERE id = ?`;
        connection.db.execute(updateQtyQuery, [newQty, inventory_id], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database update error' });
            }

            const insertTransactionQuery = `INSERT INTO inventory_transactions (inventory_id, type, qty, customer_id) VALUES (?, ?, ?, ?)`;
            connection.db.execute(insertTransactionQuery, [inventory_id, type, qty, customer_id], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Transaction logging error' });
                }

                res.status(201).json({ success: true, message: 'Transaction recorded successfully' });
            });
        });
    });
};



exports.listInventoryTransactions = (req, res) => {
    let { page, inventory_id, type, customer_id } = req.query;

    const limit = 10;
    page = page ? parseInt(page, 10) : 1;

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page value' });
    }

    const offset = (page - 1) * limit;

    let listQuery = `
        SELECT it.id, i.name as inventory_name, it.type, it.qty, c.name as customer_name, it.created_at 
        FROM inventory_transactions it
        LEFT JOIN inventory i ON it.inventory_id = i.id
        LEFT JOIN customers c ON it.customer_id = c.id
        WHERE 1 = 1
    `;

    let countQuery = `
        SELECT COUNT(it.id) AS total 
        FROM inventory_transactions it 
        WHERE 1 = 1
    `;

    let queryParams = [];

    if (inventory_id) {
        listQuery += ' AND it.inventory_id = ?';
        countQuery += ' AND it.inventory_id = ?';
        queryParams.push(inventory_id);
    }

    if (type) {
        listQuery += ' AND it.type = ?';
        countQuery += ' AND it.type = ?';
        queryParams.push(type);
    }

    if (customer_id) {
        listQuery += ' AND it.customer_id = ?';
        countQuery += ' AND it.customer_id = ?';
        queryParams.push(customer_id);
    }

    listQuery += ` LIMIT ${limit} OFFSET ${offset}`;

    connection.db.execute(countQuery, queryParams, (err, countResults) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        const totalItems = countResults[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        connection.db.execute(listQuery, queryParams, (err, listResults) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database query error' });
            }

            res.status(200).json({
                success: true,
                data: listResults,
                pagination: {
                    currentPage: page,
                    totalItems,
                    totalPages,
                    limit
                }
            });
        });
    });
};
