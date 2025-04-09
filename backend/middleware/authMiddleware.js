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
    // Ensure the decoded user has the _id field for MongoDB
    req.user = {
      _id: decoded.id || decoded._id, // Use either format depending on what's in the token
      ...decoded,
    };
    next();
  } catch (err) {
    // Log the error but don't block the request
    console.warn("Token verification failed:", err.message);

    // Check if the token matches the JWT_ADMIN_SECRET directly
    // This is a special case for when someone is using the admin secret directly
    if (token === dotEnv.JWT_ADMIN_SECRET) {
      console.log("Using JWT_ADMIN_SECRET directly as token");
      req.user = {
        _id: "admin", // Special ID for admin
        role: "admin",
      };
      return next();
    }

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
    // Ensure the decoded user has the _id field for MongoDB
    req.user = {
      _id: decoded.id || decoded._id, // Use either format depending on what's in the token
      ...decoded,
    };
    console.log(
      "Token verified for user:",
      req.user._id,
      "role:",
      decoded.role
    );
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);

    // Check if the token equals the JWT_ADMIN_SECRET itself
    // This is an escape hatch for admin access
    if (token === dotEnv.JWT_ADMIN_SECRET) {
      console.log("Using JWT_ADMIN_SECRET directly as token");
      req.user = {
        _id: "admin", // Special ID for admin
        role: "admin",
      };
      return next();
    }

    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
