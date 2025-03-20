const express = require("express");
const router = express.Router();
const {
    getAll,
    createEnergyEmission,
    getEnergyEmission,
    updateEnergyEmission,
    deleteEnergyEmission,
} = require("../controllers/energyEmissionController");

// ✅ Routes
router.get("/", getAll);
router.post("/", createEnergyEmission);
router.get("/:userId/:year/:month", getEnergyEmission);
router.put("/:id", updateEnergyEmission);
router.delete("/:id", deleteEnergyEmission);

module.exports = router;
