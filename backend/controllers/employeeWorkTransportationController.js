const EmployeeWorkWorkTransportation = require("../models/EmployeeWorkTransportation"); // Import the model

// Get Work Transportation records - either global or for a specific employee
exports.getWorkTransportationRecords = async (req, res) => {
  try {
    const records = await EmployeeWorkWorkTransportation.find({}).populate(
      "transport"
    );
    res.status(200).json({
      message: "Work Transportation records retrieved successfully!",
      data: records,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching Work transportation records" });
  }
};

// Create a new Work Transportation record
exports.createWorkTransportationRecord = async (req, res) => {
  try {
    const {
      carType,
      transport,
      co2Emission,
      usageType,
      workFromHomeDays,
      recurrenceDays,
      employeeId,
      date,
    } = req.body;
    console.log(date, "test");

    // Validation: Ensure required fields are present
    if (
      !carType ||
      !transport ||
      !co2Emission ||
      !usageType ||
      !employeeId ||
      !date
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const workTransportationRecord =
      await EmployeeWorkWorkTransportation.create({
        carType,
        transport,
        co2Emission,
        usageType,
        workFromHomeDays,
        recurrenceDays,
        employeeId,
        date,
      });

    res.status(201).json({
      message: "Work Transportation record added successfully!",
      data: workTransportationRecord,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error saving Work transportation record" });
  }
};

// Update an existing Work Transportation record
exports.updateWorkTransportationRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Get fields from request body

    // Find the Work Transportation record by ID and update it
    const updatedRecord =
      await EmployeeWorkWorkTransportation.findByIdAndUpdate(id, updateData, {
        new: true,
      });

    if (!updatedRecord) {
      return res
        .status(404)
        .json({ message: "Work Transportation record not found" });
    }

    res.status(200).json({
      message: "Work Transportation record updated successfully!",
      data: updatedRecord,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating Work transportation record" });
  }
};

// Delete a Work Transportation record
exports.deleteWorkTransportationRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the Work Transportation record
    const deletedRecord =
      await EmployeeWorkWorkTransportation.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res
        .status(404)
        .json({ message: "Work Transportation record not found" });
    }

    res.status(200).json({
      message: "Work Transportation record deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Work transportation record" });
  }
};
