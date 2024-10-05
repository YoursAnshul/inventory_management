const connection = require('./db-connection.js');

exports.addCategory = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Category name are required' });
    }

    const checkUserQuery = 'SELECT name FROM categories WHERE name = ? AND status= ? ';
    connection.db.execute(checkUserQuery, [name, 'ACTIVE'], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }

        const insertCategoryQuery = 'INSERT INTO categories (name, created_at,updated_at, status) VALUES (?, NOW(),NOW(), ?)';
        connection.db.execute(insertCategoryQuery, [name, 'ACTIVE'], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error registering Category' });
            }
            res.status(201).json({ success: true, message: 'Category registered successfully' });           
        });
    });
}


// Update category
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const checkCategoryQuery = 'SELECT id FROM categories WHERE id = ? AND status = ?';
    connection.db.execute(checkCategoryQuery, [id, 'ACTIVE'], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const updateCategoryQuery = 'UPDATE categories SET name = ?, updated_at = NOW() WHERE id = ?';
        connection.db.execute(updateCategoryQuery, [name, id], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error updating Category' });
            }
            res.status(200).json({ success: true, message: 'Category updated successfully' });
        });
    });
};


// Delete category
exports.deleteCategory = (req, res) => {
    const { id } = req.params;

    const checkCategoryQuery = 'SELECT id FROM categories WHERE id = ? AND status = ?';
    connection.db.execute(checkCategoryQuery, [id, 'ACTIVE'], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const deleteCategoryQuery = 'UPDATE categories SET status = ?, updated_at = NOW() WHERE id = ?';
        connection.db.execute(deleteCategoryQuery, ['DELETED', id], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error deleting Category' });
            }
            res.status(200).json({ success: true, message: 'Category deleted successfully' });
        });
    });
};



// List categories with pagination
exports.listCategories = (req, res) => {
    let { page, keyword, date_from, date_to } = req.query;

    const limit = 10;
    page = page ? parseInt(page, 10) : 1;

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page value' });
    }

    const offset = (page - 1) * limit;

    let listQuery = `SELECT id, name, created_at, updated_at, status FROM categories WHERE status = ?`;
    let countQuery = `SELECT COUNT(id) AS total FROM categories WHERE status = ?`;
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



// Get category details by ID
exports.getCategoryDetails = (req, res) => {
    const { id } = req.params;

    const getCategoryQuery = 'SELECT id, name, created_at, updated_at, status FROM categories WHERE id = ? AND status = ?';
    connection.db.execute(getCategoryQuery, [id, 'ACTIVE'], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};