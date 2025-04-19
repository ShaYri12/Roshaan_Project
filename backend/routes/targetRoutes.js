const express = require("express");
const router = express.Router();
const Target = require("../models/Target");
const { authenticateToken } = require("../middleware/auth");

// Get all targets
router.get("/", authenticateToken, async (req, res) => {
  try {
    const targets = await Target.find().populate("scenarioId");
    res.json(targets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new target
router.post("/", authenticateToken, async (req, res) => {
  const target = new Target({
    name: req.body.name,
    description: req.body.description,
    targetYear: req.body.targetYear,
    reductionGoal: req.body.reductionGoal,
    baselineYear: req.body.baselineYear,
    baselineEmissions: req.body.baselineEmissions,
    status: req.body.status || "active",
    scenarioId: req.body.scenarioId,
    milestones: req.body.milestones || [],
  });

  try {
    const newTarget = await target.save();
    const populatedTarget = await Target.findById(newTarget._id).populate(
      "scenarioId"
    );
    res.status(201).json(populatedTarget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a target
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "Target not found" });
    }

    Object.assign(target, req.body);
    const updatedTarget = await target.save();
    const populatedTarget = await Target.findById(updatedTarget._id).populate(
      "scenarioId"
    );
    res.json(populatedTarget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a target
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Target.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Target not found" });
    }
    res.json({ message: "Target deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
