const WorkingHours = require("../models/WorkingHours");

// Get all working hours
exports.getWorkingHours = async (req, res) => {
  try {
    const workingHours = await WorkingHours.find();
    res.json(workingHours);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create new working hours record
exports.createWorkingHours = async (req, res) => {
  const { date, transportation, startLocation, endLocation, time } = req.body;

  try {
    const newWorkingHours = new WorkingHours({
      date,
      transportation,
      startLocation,
      endLocation,
      time,
    });

    await newWorkingHours.save();
    res.status(201).json(newWorkingHours);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
