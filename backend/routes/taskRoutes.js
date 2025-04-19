const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { authenticateToken } = require("../middleware/auth");

// Get all tasks
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find().populate("targetId").populate("measureId");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by targetId
router.get("/target/:targetId", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ targetId: req.params.targetId })
      .populate("targetId")
      .populate("measureId");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by measureId
router.get("/measure/:measureId", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ measureId: req.params.measureId })
      .populate("targetId")
      .populate("measureId");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post("/", authenticateToken, async (req, res) => {
  const task = new Task({
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    dueDate: req.body.dueDate,
    completionDate: req.body.completionDate,
    status: req.body.status || "pending",
    priority: req.body.priority || "medium",
    assignedTo: req.body.assignedTo,
    progress: req.body.progress || 0,
    notes: req.body.notes,
    targetId: req.body.targetId,
    measureId: req.body.measureId,
  });

  try {
    const newTask = await task.save();
    const populatedTask = await Task.findById(newTask._id)
      .populate("targetId")
      .populate("measureId");
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a task
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate("targetId")
      .populate("measureId");
    res.json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Task.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
