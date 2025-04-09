const express = require("express");
const router = express.Router();
const emissionController = require("../controllers/emissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all emission records - allowing global parameter without strict auth
router.get("/", authMiddleware, emissionController.getEmissionRecords);

// The rest of the routes require authentication
router.use(authMiddleware.required);

// Get an emission record by ID
router.get("/:id", emissionController.getEmissionRecordById);

// Create a new emission record
router.post("/", emissionController.createEmissionRecord);

// Update an emission record
router.put("/:id", emissionController.updateEmissionRecord);

// Delete an emission record
router.delete("/:id", emissionController.deleteEmissionRecord);

module.exports = router;
