const express = require("express");
const router = express.Router();
const workingHoursController = require("../controllers/workingHoursController");

// Get all working hours records
router.get("/", workingHoursController.getWorkingHours);

// Create new working hours record
router.post("/", workingHoursController.createWorkingHours);

module.exports = router;
