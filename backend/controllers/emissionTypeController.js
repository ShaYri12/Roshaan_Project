const EmissionType = require("../models/EmissionType");

// Create a new emission type
exports.createEmissionType = async (req, res) => {
  try {
    const newEmissionType = new EmissionType(req.body);
    await newEmissionType.save();
    res.status(201).json(newEmissionType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all emission types
exports.getAllEmissionTypes = async (req, res) => {
  try {
    const emissionTypes = await EmissionType.find();
    res.status(200).json(emissionTypes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an emission type
exports.updateEmissionType = async (req, res) => {
  try {
    const updatedEmissionType = await EmissionType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedEmissionType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an emission type
exports.deleteEmissionType = async (req, res) => {
  try {
    await EmissionType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Emission type deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
