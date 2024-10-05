const connection = require("./db-connection.js");

// Get Dashboard data
exports.getDashboardData = async (req, res) => {
  const queries = {
    totalUsers: "SELECT COUNT(*) AS total FROM users WHERE status = ?",
    totalCustomers: "SELECT COUNT(*) AS total FROM customers WHERE status = ?",
    totalCategories:
      "SELECT COUNT(*) AS total FROM categories WHERE status = ?",
    totalInventory: "SELECT COUNT(*) AS total FROM inventory WHERE status = ?",
  };

  try {
    const [
      totalUsersResult,
      totalCustomersResult,
      totalCategoriesResult,
      totalInventoryResult,
    ] = await Promise.all([
      executeQuery(queries.totalUsers, ["ACTIVE"]),
      executeQuery(queries.totalCustomers, ["ACTIVE"]),
      executeQuery(queries.totalCategories, ["ACTIVE"]),
      executeQuery(queries.totalInventory, ["ACTIVE"]),
    ]);

    const dashboardData = {
      totalUsers: totalUsersResult[0].total,
      totalCustomers: totalCustomersResult[0].total,
      totalCategories: totalCategoriesResult[0].total,
      totalInventory: totalInventoryResult[0].total,
    };
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard data." });
  }
};

const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    connection.db.execute(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
