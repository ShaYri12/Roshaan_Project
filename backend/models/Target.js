const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  targetYear: {
    type: Number,
    required: true,
  },
  reductionGoal: {
    type: Number,
    required: true,
  },
  baselineYear: {
    type: Number,
    required: true,
  },
  baselineEmissions: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "achieved", "missed", "cancelled"],
    default: "active",
  },
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scenario",
    required: true,
  },
  milestones: [
    {
      year: Number,
      targetReduction: Number,
      actualReduction: Number,
      status: {
        type: String,
        enum: ["pending", "achieved", "missed"],
        default: "pending",
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
targetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Target", targetSchema);
