const express = require("express");
const router = express.Router();
const Scenario = require("../models/Scenario");
const { authenticateToken } = require("../middleware/auth");

// Get all scenarios
router.get("/", authenticateToken, async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new scenario
router.post("/", authenticateToken, async (req, res) => {
  const scenario = new Scenario({
    name: req.body.name,
    description: req.body.description,
    startYear: req.body.startYear,
    endYear: req.body.endYear,
    baselineEmissions: req.body.baselineEmissions,
    targetReduction: req.body.targetReduction,
    measures: req.body.measures || [],
  });

  try {
    const newScenario = await scenario.save();
    res.status(201).json(newScenario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a scenario
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ message: "Scenario not found" });
    }

    Object.assign(scenario, req.body);
    const updatedScenario = await scenario.save();
    res.json(updatedScenario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a scenario
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Scenario.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Scenario not found" });
    }
    res.json({ message: "Scenario deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
