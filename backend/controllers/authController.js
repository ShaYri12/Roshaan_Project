const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
require("dotenv").config();
const dotEnv = process.env;

// Register new user
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log(req.body);
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      dotEnv.JWT_ADMIN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created successfully",
      jwtToken,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  try {
    // First check admin users
    const user = await User.findOne({ email });

    if (user) {
      // Compare plain text password with stored plain text password (for now)
      // In a production environment, you should use bcrypt to compare hashed passwords
      const passwordMatch = user.password === password;

      if (!passwordMatch) {
        console.log("Password does not match for admin");
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const jwtToken = jwt.sign(
        { id: user._id, role: user.role },
        dotEnv.JWT_ADMIN_SECRET,
        { expiresIn: "1h" }
      );

      console.log("Admin login successful:", user.email);
      return res.status(200).json({
        message: "Logged in successfully",
        jwtToken,
        role: user.role,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    }

    // If no admin user found, check Employee collection
    const employee = await Employee.findOne({ email }).populate("car");

    if (employee) {
      // Compare plain text password with stored plain text password (for now)
      const passwordMatch = employee.password === password;

      if (!passwordMatch) {
        console.log("Password does not match for employee");
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Use the same secret for consistency
      const jwtToken = jwt.sign(
        { id: employee._id, role: "employee" },
        dotEnv.JWT_ADMIN_SECRET,
        { expiresIn: "1h" }
      );

      console.log("Employee login successful:", employee.email);
      return res.status(200).json({
        message: "Logged in successfully",
        jwtToken,
        role: "employee",
        user: employee,
      });
    }

    // If no user or employee found
    console.log("No user found with email:", email);
    return res.status(400).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login using password bycrypt
// // Login user
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // const testHash = await bcrypt.hash(password, 10);
//     // console.log("Test Hash:", testHash);
//     // console.log(
//     //   "Does it match stored hash?",
//     //   await bcrypt.compare("randomPassword123!", user.password)
//     // );

//     const isMatch = await bcrypt.compare(password, user.password);

//     console.log(isMatch);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       dotEnv.JWT_ADMIN_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       message: "Logged in successfully",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// Add new validateToken endpoint
exports.validateToken = async (req, res) => {
  // The authMiddleware.required has already verified the token
  // If execution reaches here, token is valid
  try {
    // Return the decoded user from the token
    return res.status(200).json({
      valid: true,
      user: {
        id: req.user._id,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("Token validation error:", err);
    return res.status(401).json({
      valid: false,
      message: "Token validation failed",
    });
  }
};
