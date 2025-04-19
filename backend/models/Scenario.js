const mongoose = require("mongoose");

const scenarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startYear: {
    type: Number,
    required: true,
  },
  endYear: {
    type: Number,
    required: true,
  },
  baselineEmissions: {
    type: Number,
    required: true,
  },
  targetReduction: {
    type: Number,
    required: true,
  },
  measures: [
    {
      name: String,
      description: String,
      potentialReduction: Number,
      implementationDate: Date,
      status: {
        type: String,
        enum: ["planned", "in-progress", "completed", "cancelled"],
        default: "planned",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
scenarioSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Scenario", scenarioSchema);
