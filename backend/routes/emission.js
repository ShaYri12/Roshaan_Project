const express = require("express");
const router = express.Router();
const emissionController = require("../controllers/emissionController");

// Get all emission records
router.get("/", emissionController.getEmissionRecords);

// Get an emission record by ID
router.get("/:id", emissionController.getEmissionRecordById);

// Create a new emission record
router.post("/", emissionController.createEmissionRecord);

// Update an emission record
router.put("/:id", emissionController.updateEmissionRecord);

// Delete an emission record
router.delete("/:id", emissionController.deleteEmissionRecord);

module.exports = router;
