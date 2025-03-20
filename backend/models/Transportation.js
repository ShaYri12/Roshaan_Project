const mongoose = require("mongoose");

const transportationSchema = new mongoose.Schema(
  {
    name: String,
    type: { type: String, enum: ["car", "bike", "plane"], required: true },
    licensePlate: { type: String },
    companyCar: { type: Boolean },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Employee model
      ref: "Employee", // This establishes a relationship with the Employee model
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle", // Reference to Vehicle model
    },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transportation", transportationSchema);
