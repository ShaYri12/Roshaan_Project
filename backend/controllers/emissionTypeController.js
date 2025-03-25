const EmissionType = require("../models/EmissionType");

// Create a new emission type
exports.createEmissionType = async (req, res) => {
  try {
    const newEmissionType = new EmissionType(req.body);
    await newEmissionType.save();
    res.status(201).json(newEmissionType);
  } catch (error) {
    console.error("Error creating emission type:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all emission types
exports.getAllEmissionTypes = async (req, res) => {
  try {
    const emissionTypes = await EmissionType.find();
    res.status(200).json(emissionTypes);
  } catch (error) {
    console.error("Error fetching emission types:", error);
    res.status(500).json({ error: error.message });
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

    if (!updatedEmissionType) {
      return res.status(404).json({ error: "Emission type not found" });
    }

    res.status(200).json(updatedEmissionType);
  } catch (error) {
    console.error("Error updating emission type:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an emission type
exports.deleteEmissionType = async (req, res) => {
  try {
    const deletedEmissionType = await EmissionType.findByIdAndDelete(
      req.params.id
    );

    if (!deletedEmissionType) {
      return res.status(404).json({ error: "Emission type not found" });
    }

    res.status(200).json({ message: "Emission type deleted successfully" });
  } catch (error) {
    console.error("Error deleting emission type:", error);
    res.status(500).json({ error: error.message });
  }
};
