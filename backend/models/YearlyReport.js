const mongoose = require("mongoose");

const YearlyReportSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    totalEmissions: {
      type: Number,
      required: true,
    },
    monthlyData: {
      type: [Number],
      required: true,
      validate: {
        validator: function (array) {
          return array.length === 12; // Must have data for all 12 months
        },
        message: "Monthly data must contain 12 values (one for each month)",
      },
    },
    categoryData: {
      type: [Number],
      required: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YearlyReport", YearlyReportSchema);
