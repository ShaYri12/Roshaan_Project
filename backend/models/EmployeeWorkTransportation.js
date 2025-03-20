const mongoose = require("mongoose");

const employee_work_transportationSchema = new mongoose.Schema(
  {
    carType: {
      type: String,
      required: true,
    },

    co2Emission: {
      type: String,
      required: true,
    },
    usageType: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    workFromHomeDays: {
      type: String,
    },
    recurrenceDays: {
      type: String,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Assuming the Employee model is named "Employee"
      required: true,
    },
    transport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transportation",
    },
  },
  { timestamps: true } // To auto-generate createdAt and updatedAt fields
);

// Model export
module.exports = mongoose.model(
  "Employee_Work_Transportation",
  employee_work_transportationSchema
);
