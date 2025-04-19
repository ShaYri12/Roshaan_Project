const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided in request");
    return res
      .status(401)
      .json({ message: "Authentication token is required" });
  }

  try {
    // Try to verify with user token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        console.log("Token verified with JWT_SECRET");
        req.user = user;
        return next();
      }

      console.log("JWT_SECRET verification failed, trying JWT_ADMIN_SECRET");

      // If user token fails, try admin token
      jwt.verify(token, process.env.JWT_ADMIN_SECRET, (adminErr, admin) => {
        if (adminErr) {
          console.log(
            "JWT_ADMIN_SECRET verification failed:",
            adminErr.message
          );
          return res
            .status(403)
            .json({ message: "Invalid token", error: adminErr.message });
        }
        console.log("Token verified with JWT_ADMIN_SECRET");
        req.user = admin;
        next();
      });
    });
  } catch (error) {
    console.log("Token verification exception:", error.message);
    return res
      .status(403)
      .json({ message: "Invalid token", error: error.message });
  }
};

module.exports = {
  authenticateToken,
};
