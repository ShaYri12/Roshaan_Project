const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    transportationMode: {
      type: String,
      enum: ["car", "bike", "walking", "plane", "public transport"],
      required: true,
    },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkingHours", workingHoursSchema);
