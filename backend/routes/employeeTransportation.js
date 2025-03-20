const express = require("express");
const router = express.Router();
const employeeTransportation = require("../controllers/employeeTransportationController");

// GET endpoint to create a new transportation record
router.get("/", employeeTransportation.getTransportationRecords);

// POST endpoint to create a new transportation record
router.post("/", employeeTransportation.createTransportationRecord);

// PUT endpoint to update an existing transportation record by ID
router.put("/:id", employeeTransportation.updateTransportationRecord);

// DELETE endpoint to delete a transportation record by ID
router.delete("/:id", employeeTransportation.deleteTransportationRecord);

module.exports = router;
