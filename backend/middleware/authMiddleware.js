const jwt = require("jsonwebtoken");
require("dotenv").config();
const dotEnv = process.env;

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  let token;

  // Extract token from Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

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
  const authHeader = req.header("Authorization");
  let token;

  // Extract token from Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    console.error("Access denied - No token provided");
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, dotEnv.JWT_ADMIN_SECRET);
    req.user = decoded;
    console.log("Token verified for user:", decoded.id, "role:", decoded.role);
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
