const Vehicle = require("../models/Vehicle");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a vehicle by ID
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a vehicle by ID
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🚗 Mark Vehicle as Favorite (User Feature)
exports.markFavorite = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.isFavorite = !vehicle.isFavorite;
    await vehicle.save();

    res.json({ message: "Favorite Updated!", vehicle });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🚗 Get User-Specific Vehicles
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
