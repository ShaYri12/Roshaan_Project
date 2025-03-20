const express = require("express");
const router = express.Router();
const employeeWorkTransportation = require("../controllers/employeeWorkTransportationController");

// GET endpoint to create a new transportation record
router.get("/", employeeWorkTransportation.getWorkTransportationRecords);

// POST endpoint to create a new transportation record
router.post("/", employeeWorkTransportation.createWorkTransportationRecord);

// PUT endpoint to update an existing transportation record by ID
router.put("/:id", employeeWorkTransportation.updateWorkTransportationRecord);

// DELETE endpoint to delete a transportation record by ID
router.delete(
  "/:id",
  employeeWorkTransportation.deleteWorkTransportationRecord
);

module.exports = router;
