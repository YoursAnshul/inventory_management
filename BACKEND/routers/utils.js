const jwt = require("jsonwebtoken");

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
};


module.exports = getUserIdFromToken;
