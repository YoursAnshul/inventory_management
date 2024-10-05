const connection = require('./db-connection.js');

// Get all categories
exports.getCategories = (req, res) => {
    const query = `SELECT id, name FROM categories WHERE status = 'ACTIVE'`;

    connection.db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        res.status(200).json({ success: true, data: results });
    });
};

// Get all customers
exports.getCustomers = (req, res) => {
    const query = `SELECT id, name FROM customers WHERE status = 'ACTIVE'`;

    connection.db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        res.status(200).json({ success: true, data: results });
    });
};

// Add a new inventory
exports.addInventory = (req, res) => {
    const { name, category_id, price } = req.body;

    if (!name || !category_id) {
        return res.status(400).json({ success: false, message: 'Name and Category are required' });
    }

    const checkDuplicateQuery = `SELECT id FROM inventory WHERE name = ? AND category_id = ? AND status = 'ACTIVE'`;
    connection.db.execute(checkDuplicateQuery, [name, category_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Inventory with this name and category already exists' });
        }

        const insertInventoryQuery = `INSERT INTO inventory (name, category_id, price, status) VALUES (?, ?, ?, 'ACTIVE')`;
        connection.db.execute(insertInventoryQuery, [name, category_id, price], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error adding inventory' });
            }
            res.status(201).json({ success: true, message: 'Inventory added successfully' });
        });
    });
};

// Update inventory
exports.updateInventory = (req, res) => {
    const { id } = req.params;
    const { name, category_id, price } = req.body;

    const updateQuery = `UPDATE inventory SET name = ?, category_id = ?, price = ?, status = 'ACTIVE' WHERE id = ?`;
    connection.db.execute(updateQuery, [name, category_id, price, id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, message: 'Inventory updated successfully' });
    });
};

// Delete inventory (soft delete)
exports.deleteInventory = (req, res) => {
    const { id } = req.params;

    const deleteQuery = `UPDATE inventory SET status = 'DELETED' WHERE id = ?`;
    connection.db.execute(deleteQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, message: 'Inventory deleted successfully' });
    });
};

// List all inventories with pagination
exports.listInventoryDetails = (req, res) => {
    let query = `
        SELECT 
            inv.id, 
            inv.name, 
            inv.category_id, 
            inv.price, 
            inv.status, 
            inv.created_at, 
            inv.updated_at, 
            COALESCE(SUM(CASE WHEN it.type = 'IN' THEN it.qty ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN it.type = 'OUT' THEN it.qty ELSE 0 END), 0) AS available_qty,
            c.name AS category_name
        FROM 
            inventory inv
        LEFT JOIN 
            inventory_transactions it ON inv.id = it.inventory_id
        LEFT JOIN 
            categories c ON inv.category_id = c.id
        WHERE 
            inv.status = 'ACTIVE'
    `;
    
    let queryParams = [];


    query += `
        GROUP BY 
            inv.id, inv.name, inv.category_id, inv.price, inv.status, inv.created_at, inv.updated_at, c.name
    `;

    connection.db.execute(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        res.status(200).json({ success: true, data: results });
    });
};


// List all inventories with pagination
exports.listInventory = (req, res) => {
    let { page, keyword, date_from, date_to } = req.query;
    const limit = 10;
    page = page ? parseInt(page, 10) : 1;

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page value' });
    }

    const offset = (page - 1) * limit;

    let listQuery = `
        SELECT 
            inv.id, 
            inv.name, 
            inv.category_id, 
            inv.price, 
            inv.status, 
            inv.created_at, 
            inv.updated_at, 
            COALESCE(SUM(CASE WHEN it.type = 'IN' THEN it.qty ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN it.type = 'OUT' THEN it.qty ELSE 0 END), 0) AS available_qty,
            c.name AS category_name
        FROM 
            inventory inv
        LEFT JOIN 
            inventory_transactions it ON inv.id = it.inventory_id
        LEFT JOIN 
            categories c ON inv.category_id = c.id
        WHERE 
            inv.status = 'ACTIVE'
    `;

    let countQuery = `
        SELECT COUNT(*) AS total FROM (
            SELECT inv.id 
            FROM inventory inv 
            LEFT JOIN inventory_transactions it ON inv.id = it.inventory_id
            LEFT JOIN categories c ON inv.category_id = c.id 
            WHERE inv.status = 'ACTIVE'
    `;
    
    let queryParams = [];

    if (keyword) {
        listQuery += ` AND inv.name LIKE ?`;
        countQuery += ` AND inv.name LIKE ?`;
        queryParams.push(`%${keyword}%`);
    }
    if (date_from) {
        listQuery += ` AND inv.created_at >= ?`;
        countQuery += ` AND inv.created_at >= ?`;
        queryParams.push(date_from);
    }
    if (date_to) {
        listQuery += ` AND inv.created_at <= ?`;
        countQuery += ` AND inv.created_at <= ?`;
        queryParams.push(date_to);
    }

    listQuery  += `
        GROUP BY 
            inv.id, inv.name, inv.category_id, inv.price, inv.status, inv.created_at, inv.updated_at, c.name
        LIMIT ${limit} OFFSET ${offset}
    `;

    countQuery  += `
        GROUP BY 
            inv.id, inv.name, inv.category_id, inv.price, inv.status, inv.created_at, inv.updated_at, c.name
        ) as z
    `;

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

exports.inventoryInOutGraph = (req, res) => {
    let query = `select  sum(case when type = 'IN' then qty else 0 end) as inQty, 
                sum(case when type = 'OUT' then qty else 0 end) as outQty, i.name
                from inventory_transactions it left join inventory i on i.id = it.inventory_id
                group by  i.id order by inQty `

    connection.db.execute(query, [], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        res.status(200).json({
            success: true,
            data: result,
         });
    });
};

exports.inventoryTransaction = (req, res) => {
    const { inventory_id, type, qty, customer_id } = req.body;

    if (!inventory_id || !type || !qty || (type !== 'IN' && type !== 'OUT')) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const stockQuery = `
        SELECT 
            SUM(CASE WHEN type = 'IN' THEN qty ELSE -qty END) AS stock 
        FROM inventory_transactions 
        WHERE inventory_id = ?
    `;

    connection.db.execute(stockQuery, [inventory_id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        const currentStock = results[0].stock || 0;

        if (type === 'OUT' && currentStock < qty) {
            return res.status(400).json({ success: false, message: 'Insufficient quantity for OUT transaction' });
        }

        const insertTransactionQuery = `INSERT INTO inventory_transactions (inventory_id, type, qty, customer_id) VALUES (?, ?, ?, ?)`;
        connection.db.execute(insertTransactionQuery, [inventory_id, type, qty, customer_id], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Transaction logging error' });
            }

            res.status(201).json({ success: true, message: 'Transaction recorded successfully' });
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

    let countQuery = `SELECT COUNT(it.id) AS total FROM inventory_transactions it WHERE 1 = 1`;

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

    listQuery += ` ORDER BY it.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    connection.db.execute(countQuery, queryParams, (err, countResults) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        const total = countResults[0].total;

        connection.db.execute(listQuery, queryParams, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database query error' });
            }

            res.status(200).json({
                success: true,
                data: results,
                pagination: {
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
            });
        });
    });
};