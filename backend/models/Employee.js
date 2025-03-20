const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    homeAddress: { type: String, required: true },
    companyAddress: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"], // Email validation regex
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transportation",
    },
    jwtToken: {
      type: String, // Field to store JWT token
      default: function () {
        return jwt.sign(
          { userId: this._id, role: this.role },
          process.env.JWT_EMPLOYEE_SECRET,
          { expiresIn: "1h" }
        );
      },
    },
  },
  { timestamps: true }
);

// Password hashing before saving to the database
// employeeSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // Only hash the password if it's modified
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// // Password comparison method
// employeeSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("Employee", employeeSchema);
