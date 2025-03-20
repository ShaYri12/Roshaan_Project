const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    vehicleType: {
      type: String,
      enum: ["Car", "Bike", "Truck", "Other"],
    },
    engineNumber: { type: String, required: true,  },
    vehicleModel: { type: String, required: true },
    vehicleUseFor: {
      type: String,
      required: true,
      enum: ["Personal", "Company"],
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isFavorite: { type: Boolean, default: false },
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

module.exports = mongoose.model("Vehicle", vehicleSchema);
