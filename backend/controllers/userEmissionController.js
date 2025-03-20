const UserEmission = require("../models/UserEmission");

// Create a new emission entry
exports.createEmission = async (req, res) => {
  try {
    const newEmission = new UserEmission(req.body);
    await newEmission.save();
    res.status(201).json(newEmission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all emission entries for a user
exports.getEmissionsByUser = async (req, res) => {
  try {
    const emissions = await UserEmission.find({
      userId: req.params.userId,
    }).populate("emissionType");
    res.status(200).json(emissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an emission entry
exports.updateEmission = async (req, res) => {
  try {
    const updatedEmission = await UserEmission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedEmission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an emission entry
exports.deleteEmission = async (req, res) => {
  try {
    await UserEmission.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Emission entry deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
