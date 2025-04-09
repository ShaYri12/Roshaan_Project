const express = require("express");
const router = express.Router();
const emissionController = require("../controllers/emissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Use the non-strict auth middleware for all routes
// This allows the JWT_ADMIN_SECRET to work for all endpoints
router.use(authMiddleware);

// Get all emission records - allowing global parameter without strict auth
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
