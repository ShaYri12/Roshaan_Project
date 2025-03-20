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

    // Create a new user
    const user = new User({ username, email, password, role });

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
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (user) {
      const jwtToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ADMIN_SECRET,
        { expiresIn: "1h" }
      );

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

    // If no user found in User collection, check Employee collection
    const employee = await Employee.findOne({ email, password }).populate(
      "car"
    );
    if (employee) {
      const jwtToken = jwt.sign(
        { id: employee._id, role: "employee" }, // Assuming role is 'employee' here
        process.env.JWT_EMPLOYEE_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Logged in successfully",
        jwtToken,
        role: "employee",
        user: employee,
      });
    }

    // If no user or employee found
    return res.status(400).json({ message: "Invalid credentials" });
  } catch (err) {
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
