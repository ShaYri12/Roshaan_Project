const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completionDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  assignedTo: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  notes: {
    type: String,
  },
  // References
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Target",
    required: true,
  },
  measureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Measure",
  },
  // Audit fields
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
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Task", taskSchema);
