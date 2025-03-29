const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", authController.register);

// Login an existing user
router.post("/", authController.login);

// Get current user information
router.get("/me", authMiddleware.required, async (req, res) => {
  try {
    // The user ID is available in req.user.id from the middleware
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "admin") {
      const User = require("../models/User");
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else if (role === "employee") {
      const Employee = require("../models/Employee");
      const employee = await Employee.findById(userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      return res.status(200).json(employee);
    } else {
      return res.status(403).json({ message: "Invalid user role" });
    }
  } catch (err) {
    console.error("Error in /me endpoint:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
