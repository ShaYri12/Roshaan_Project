const express = require("express");
const router = express.Router();
const yearlyReportController = require("../controllers/yearlyReportController");
const authMiddleware = require("../middleware/authMiddleware");

// Generate a new yearly report
router.post("/", authMiddleware, yearlyReportController.generateReport);

// Get all yearly reports (with optional userId filter)
router.get("/", authMiddleware, yearlyReportController.getAllReports);

// Get report by ID
router.get("/:id", authMiddleware, yearlyReportController.getReportById);

// Get report by year
router.get(
  "/year/:year",
  authMiddleware,
  yearlyReportController.getReportByYear
);

// New route for Jaaropgave export in various formats
router.get(
  "/jaaropgave/:reportId/:format",
  authMiddleware,
  yearlyReportController.generateJaaropgaveExport
);

// Delete a report
router.delete("/:id", authMiddleware, yearlyReportController.deleteReport);

module.exports = router;
