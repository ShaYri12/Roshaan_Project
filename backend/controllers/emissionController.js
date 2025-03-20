const EmissionRecord = require("../models/Emission");
const mongoose = require("mongoose");

// Function to calculate distance between two geographic points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Function to calculate CO2 emissions based on distance and transportation mode
function calculateCO2(distance, transportation) {
  // Example CO2 emissions per km for different transportation types
  const co2EmissionsPerKm = {
    car: 0.2, // kg CO2 per km for a car
    bus: 0.1, // kg CO2 per km for a bus
    train: 0.05, // kg CO2 per km for a train
  };
  return distance * (co2EmissionsPerKm[transportation] || 0);
}

// Controller for creating a new emission record
const createEmissionRecord = async (req, res) => {
  try {
    const { date, startLocation, endLocation, employee, transportation } =
      req.body;

    // Validate startLocation and endLocation
    if (
      !startLocation ||
      !startLocation.address ||
      !startLocation.lat ||
      !startLocation.lon ||
      !endLocation ||
      !endLocation.address ||
      !endLocation.lat ||
      !endLocation.lon
    ) {
      return res.status(400).json({ message: "Invalid start or end location" });
    }

    // Calculate distance between startLocation and endLocation
    const distance = await calculateDistance(
      startLocation.lat,
      startLocation.lon,
      endLocation.lat,
      endLocation.lon
    );

    // Calculate CO2 emission
    const co2Used = calculateCO2(distance, transportation);

    // Create the emission record
    const emissionRecord = new EmissionRecord({
      date,
      startLocation: {
        address: startLocation.address,
        lat: startLocation.lat,
        lon: startLocation.lon,
      },
      endLocation: {
        address: endLocation.address,
        lat: endLocation.lat,
        lon: endLocation.lon,
      },
      employee,
      transportation,
      distance,
      co2Used: parseFloat(co2Used),
    });

    // Save the record to the database
    await emissionRecord.save();

    // Respond with success
    res.status(201).json({
      message: "Emission record created successfully",
      emissionRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating emission record", error });
  }
};

const getEmissionRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid record ID" });
    }

    const record = await EmissionRecord.findById(id).populate(
      "employee transportation"
    );

    if (!record) {
      return res.status(404).json({ message: "Emission record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emission record", error });
  }
};

// Controller for getting all emission records
const getEmissionRecords = async (req, res) => {
  try {
    const { employeeId, companyId, global } = req.query;

    let query = {};
    if (global) {
      query = {}; // Fetch all records globally
    } else {
      if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
        query.employee = employeeId;
      }
      if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
        query["employee.company"] = companyId; // Assuming this field exists
      }
    }

    const records = await EmissionRecord.find(query).populate(
      "employee transportation"
    );

    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emission records", error });
  }
};

// Controller for updating an emission record
// Controller for updating an emission record
const updateEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params; // Get the record ID from the request params
    const { date, startLocation, endLocation, employee, transportation } =
      req.body;

    // Validate startLocation and endLocation
    if (
      !startLocation ||
      !startLocation.address ||
      !startLocation.lat ||
      !startLocation.lon ||
      !endLocation ||
      !endLocation.address ||
      !endLocation.lat ||
      !endLocation.lon
    ) {
      return res.status(400).json({ message: "Invalid start or end location" });
    }

    // Find the existing emission record by ID
    const emissionRecord = await EmissionRecord.findById(id);
    if (!emissionRecord) {
      return res.status(404).json({ message: "Emission record not found" });
    }

    // Update the necessary fields
    if (date) emissionRecord.date = date;
    if (startLocation) {
      emissionRecord.startLocation = {
        address: startLocation.address,
        lat: startLocation.lat,
        lon: startLocation.lon,
      };
    }
    if (endLocation) {
      emissionRecord.endLocation = {
        address: endLocation.address,
        lat: endLocation.lat,
        lon: endLocation.lon,
      };
    }
    if (employee) emissionRecord.employee = employee;
    if (transportation) emissionRecord.transportation = transportation;

    // Calculate the updated distance between startLocation and endLocation
    const distance = await calculateDistance(
      emissionRecord.startLocation.lat,
      emissionRecord.startLocation.lon,
      emissionRecord.endLocation.lat,
      emissionRecord.endLocation.lon
    );

    // Calculate the updated CO2 emission
    const co2Used = calculateCO2(distance, emissionRecord.transportation);

    // Update the record with new distance and CO2 emissions
    emissionRecord.distance = distance;
    emissionRecord.co2Used = parseFloat(co2Used);

    // Save the updated record to the database
    await emissionRecord.save();

    // Respond with success
    res.status(200).json({
      message: "Emission record updated successfully",
      emissionRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating emission record", error });
  }
};

// Controller for deleting an emission record
const deleteEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid record ID" });
    }

    const deletedRecord = await EmissionRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Emission record not found" });
    }

    res.status(200).json({ message: "Emission record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting emission record", error });
  }
};

exports.createEmissionRecord = createEmissionRecord;
exports.getEmissionRecordById = getEmissionRecordById;
exports.getEmissionRecords = getEmissionRecords;
exports.updateEmissionRecord = updateEmissionRecord;
exports.deleteEmissionRecord = deleteEmissionRecord;
