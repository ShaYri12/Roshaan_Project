const Transportation = require("../models/Transportation");

// Get all transportation records
exports.getTransportations = async (req, res) => {
  try {
    const transportations = await Transportation.find({});
    res.json(transportations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get transportation by ID
exports.getTransportationById = async (req, res) => {
  try {
    const transportation = await Transportation.findById(req.params.id);
    if (!transportation) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }
    res.json(transportation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new transportation record
exports.createTransportation = async (req, res) => {
  const { type, licensePlate, isCompanyCar } = req.body;

  try {
    const newTransportation = new Transportation({
      type,
      licensePlate,
      isCompanyCar,
    });

    await newTransportation.save();
    res.status(201).json(newTransportation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update a transportation record
exports.updateTransportation = async (req, res) => {
  const { type, licensePlate, isCompanyCar } = req.body;

  try {
    const updatedTransportation = await Transportation.findByIdAndUpdate(
      req.params.id,
      { type, licensePlate, isCompanyCar },
      { new: true }
    );
    if (!updatedTransportation) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }
    res.json(updatedTransportation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a transportation record
exports.deleteTransportation = async (req, res) => {
  try {
    const deletedTransportation = await Transportation.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTransportation) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }
    res.json({ message: "Transportation record deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
