const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");


router.get("/redution-over-time", dashboardController.redutionOverTime);
router.get("/emissions-by-date", dashboardController.emissionsByDate);
router.get("/emissions-by-category", dashboardController.emissionsByCategory);
router.get("/emissions-trend", dashboardController.emissionsTrend);

module.exports = router;
