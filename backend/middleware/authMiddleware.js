const jwt = require("jsonwebtoken");
require("dotenv").config();
const dotEnv = process.env;

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  // If no token is provided, we set req.user to null but still allow the request to proceed
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, dotEnv.JWT_ADMIN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Log the error but don't block the request
    console.warn("Token verification failed:", err.message);
    req.user = null;
    next();
  }
};

// Strict version of the middleware that requires authentication
authMiddleware.required = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, dotEnv.JWT_ADMIN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
