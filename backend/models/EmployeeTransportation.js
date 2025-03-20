const mongoose = require("mongoose");

const employee_transportationSchema = new mongoose.Schema(
  {
    transportationMode: {
      type: String,
      required: true,
      enum: ["bike", "walking", "public_transport", "car", "plane"], // Enum validation for the allowed modes
    },
    beginLocation: {
      type: String,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Assuming the Employee model is named "Employee"
      required: true,
    },
  },
  { timestamps: true } // To auto-generate createdAt and updatedAt fields
);

// Model export
module.exports = mongoose.model(
  "Employee_Transportation",
  employee_transportationSchema
);
