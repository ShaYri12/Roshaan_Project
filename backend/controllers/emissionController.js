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
    bike: 0.05, // kg CO2 per km for a bike
    plane: 0.5, // kg CO2 per km for a plane
    bus: 0.1, // kg CO2 per km for a bus
    train: 0.05, // kg CO2 per km for a train
  };

  // If transportation is a string, use it directly
  if (typeof transportation === "string") {
    // Check if it's one of our known types
    if (co2EmissionsPerKm[transportation]) {
      return distance * co2EmissionsPerKm[transportation];
    }
  }

  // Default value if we can't determine the type
  return distance * 0.2; // Default to car emissions
}

// Controller for creating a new emission record
const createEmissionRecord = async (req, res) => {
  try {
    const {
      date,
      startLocation,
      endLocation,
      employee,
      transportation,
      co2Used: providedCo2Used,
    } = req.body;

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
    const distance = calculateDistance(
      startLocation.lat,
      startLocation.lon,
      endLocation.lat,
      endLocation.lon
    );

    // Use provided CO2 value if available, otherwise calculate
    const co2Used =
      providedCo2Used !== undefined
        ? parseFloat(providedCo2Used)
        : calculateCO2(distance, transportation);

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
      co2Used: co2Used,
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
    console.log(
      "Getting emission records. User:",
      req.user ? req.user._id : "No authenticated user"
    );
    console.log("Query params:", { employeeId, companyId, global });

    // Force global access if there's no authenticated user
    const forceGlobal = !req.user || global === "true";

    // Handle global parameter or when no user is authenticated
    if (forceGlobal) {
      console.log("Global emissions access granted - retrieving all records");

      const records = await EmissionRecord.find({})
        .populate("employee")
        .populate("transportation");

      console.log(
        `Found ${records.length} emission records with global access`
      );
      return res.status(200).json(records);
    }

    // For non-global requests with authenticated user
    let query = {};

    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      // If specific employee ID is provided, fetch their records
      query.employee = employeeId;
    } else if (req.user && req.user._id) {
      // If no specific employee ID, default to the authenticated user
      query.employee = req.user._id;
    }

    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      query["employee.company"] = companyId;
    }

    console.log("Applying filters:", query);
    const records = await EmissionRecord.find(query)
      .populate("employee")
      .populate("transportation");

    console.log(
      `Found ${records.length} emission records with filtered access`
    );
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching emission records:", error);
    res.status(500).json({
      message: "Error fetching emission records",
      error: error.message,
    });
  }
};

// Controller for updating an emission record
const updateEmissionRecord = async (req, res) => {
  try {
    const { id } = req.params; // Get the record ID from the request params
    const {
      date,
      startLocation,
      endLocation,
      employee,
      transportation,
      co2Used: providedCo2Used,
    } = req.body;

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
    const distance = calculateDistance(
      emissionRecord.startLocation.lat,
      emissionRecord.startLocation.lon,
      emissionRecord.endLocation.lat,
      emissionRecord.endLocation.lon
    );

    // Use provided CO2 value if available, otherwise calculate
    if (providedCo2Used !== undefined) {
      emissionRecord.co2Used = parseFloat(providedCo2Used);
    } else {
      // Only recalculate if not provided
      const calculatedCo2 = calculateCO2(distance, transportation);
      emissionRecord.co2Used = parseFloat(calculatedCo2);
    }

    // Update the distance
    emissionRecord.distance = distance;

    // Save the updated record to the database
    await emissionRecord.save();

    // Fetch the updated record with populated fields
    const updatedRecord = await EmissionRecord.findById(id)
      .populate("employee")
      .populate("transportation");

    // Respond with success
    res.status(200).json({
      message: "Emission record updated successfully",
      emissionRecord: updatedRecord,
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
