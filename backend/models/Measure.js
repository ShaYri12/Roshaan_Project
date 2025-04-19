const mongoose = require("mongoose");

const measureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "energy",
      "transport",
      "buildings",
      "industry",
      "waste",
      "agriculture",
      "other",
    ],
  },
  implementationDate: {
    type: Date,
    required: true,
  },
  completionDate: {
    type: Date,
  },
  estimatedReduction: {
    type: Number,
    required: true,
  },
  actualReduction: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["planned", "in_progress", "completed", "cancelled"],
    default: "planned",
  },
  cost: {
    estimated: {
      type: Number,
      required: true,
    },
    actual: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  responsibleParty: {
    type: String,
    required: true,
  },
  kpis: [
    {
      name: String,
      value: Number,
      unit: String,
      date: Date,
    },
  ],
  risks: [
    {
      description: String,
      likelihood: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      impact: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      mitigationStrategy: String,
    },
  ],
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scenario",
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Target",
  },
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
measureSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Measure", measureSchema);
