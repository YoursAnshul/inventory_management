const connection = require('./db-connection.js');


exports.addCustomer = (req, res) => {
    const { name, mobile_number, email } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Customer name are required' });
    }

    const checkCustomerQuery = 'SELECT id FROM customers WHERE name = ? AND status = ?';
    connection.db.execute(checkCustomerQuery, [name, 'ACTIVE'], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Customer with this name already exists' });
        }

        const insertCustomerQuery = 'INSERT INTO customers (name, status, mobile_number, email, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
        connection.db.execute(insertCustomerQuery, [name, 'ACTIVE', mobile_number, email], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error adding customer' });
            }

            res.status(201).json({ success: true, message: 'Customer added successfully' });
        });
    });
};


exports.updateCustomer = (req, res) => {
    const { customerId } = req.params;
    const { name, mobile_number, email } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Customer name and status are required' });
    }

    const checkCustomerQuery = 'SELECT id FROM customers WHERE name = ? AND status = ? AND id != ?';
    connection.db.execute(checkCustomerQuery, [name, "ACTIVE", customerId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Customer with this name and status already exists' });
        }

        const updateCustomerQuery = 'UPDATE customers SET name = ?, status = ?, mobile_number = ?, email = ?, updated_at = NOW() WHERE id = ?';
        connection.db.execute(updateCustomerQuery, [name, "ACTIVE", mobile_number, email, customerId], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error updating customer' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Customer not found' });
            }

            res.status(200).json({ success: true, message: 'Customer updated successfully' });
        });
    });
};

exports.deleteCustomer = (req, res) => {
    const { customerId } = req.params;

    const deleteCustomerQuery = 'SELECT id FROM customers WHERE id = ? AND status = ?';
    connection.db.execute(deleteCustomerQuery, [customerId, 'ACTIVE'], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const deleteCustomerQuery = 'UPDATE customers SET status = ?, updated_at = NOW() WHERE id = ?';
        connection.db.execute(deleteCustomerQuery, ['DELETED', customerId], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error deleting Category' });
            }
            res.status(200).json({ success: true, message: 'Customer deleted successfully' });
        });
    });
};



exports.listCustomers = (req, res) => {
    let { page, keyword, date_from, date_to } = req.query;

    const limit = 10;
    page = page ? parseInt(page, 10) : 1;

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page value' });
    }

    const offset = (page - 1) * limit;

    let listQuery = `
        SELECT id, name, mobile_number, email, status, created_at, updated_at
        FROM customers
        WHERE status = ?`;
    
    let countQuery = `
        SELECT COUNT(id) AS total
        FROM customers
        WHERE status = ?`;

    let queryParams = ['ACTIVE'];

    if (keyword) {
        listQuery += ' AND name LIKE ?';
        countQuery += ' AND name LIKE ?';
        queryParams.push(`%${keyword}%`);
    }

    if (date_from) {
        listQuery += ' AND created_at >= ?';
        countQuery += ' AND created_at >= ?';
        queryParams.push(date_from);
    }

    if (date_to) {
        listQuery += ' AND created_at <= ?';
        countQuery += ' AND created_at <= ?';
        queryParams.push(date_to);
    }

    listQuery += ` LIMIT ${limit} OFFSET ${offset}`;


    connection.db.execute(countQuery, queryParams.slice(0, queryParams.length - 2), (err, countResults) => {
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