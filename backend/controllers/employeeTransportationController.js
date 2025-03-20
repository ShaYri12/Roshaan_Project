const EmployeeTransportation = require("../models/EmployeeTransportation"); // Import the model
const mongoose = require("mongoose");

// Get transportation records - either global or for a specific employee
exports.getTransportationRecords = async (req, res) => {
  try {
    // Fetch transportation records from the database
    const records = await EmployeeTransportation.find({});

    res.status(200).json({
      message: "Transportation records retrieved successfully!",
      data: records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching transportation records" });
  }
};

// Create a new transportation record
exports.createTransportationRecord = async (req, res) => {
  try {
    const {
      transportationMode,
      beginLocation,
      endLocation,
      date,
      recurring,
      employeeId,
    } = req.body;

    // Validation (check if fields are empty)
    if (
      !transportationMode ||
      !beginLocation ||
      !endLocation ||
      !date ||
      !employeeId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transportationRecord = await EmployeeTransportation.create({
      transportationMode,
      beginLocation,
      endLocation,
      date,
      recurring,
      employeeId,
    });

    res.status(201).json({
      message: "Transportation record added successfully!",
      data: transportationRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving transportation record" });
  }
};

// Update an existing transportation record
exports.updateTransportationRecord = async (req, res) => {
  try {
    const { id } = req.params; // Get the record ID from the URL
    const { transportationMode, beginLocation, endLocation, date, recurring } =
      req.body;

    // Find the transportation record by ID
    const transportationRecord = await EmployeeTransportation.findById(id);

    if (!transportationRecord) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }

    // Update the transportation record
    transportationRecord.transportationMode =
      transportationMode || transportationRecord.transportationMode;
    transportationRecord.beginLocation =
      beginLocation || transportationRecord.beginLocation;
    transportationRecord.endLocation =
      endLocation || transportationRecord.endLocation;
    transportationRecord.date = date || transportationRecord.date;
    transportationRecord.recurring =
      recurring !== undefined ? recurring : transportationRecord.recurring;

    await transportationRecord.save();

    res.status(200).json({
      message: "Transportation record updated successfully!",
      data: transportationRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating transportation record" });
  }
};

// Delete a transportation record
exports.deleteTransportationRecord = async (req, res) => {
  try {
    const { id } = req.params; // Get the record ID from the URL

    // Find the transportation record by ID
    const transportationRecord = await EmployeeTransportation.findById(id);

    if (!transportationRecord) {
      return res
        .status(404)
        .json({ message: "Transportation record not found" });
    }

    // Delete the transportation record
    await EmployeeTransportation.destroy();

    res.status(200).json({
      message: "Transportation record deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting transportation record" });
  }
};
