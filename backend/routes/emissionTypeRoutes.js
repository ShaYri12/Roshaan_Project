const express = require("express");
const router = express.Router();
const emissionTypeController = require("../controllers/emissionTypeController");

// Create a new emission type
router.post("/", emissionTypeController.createEmissionType);

// Get all emission types
router.get("/", emissionTypeController.getAllEmissionTypes);

// Update an emission type
router.put("/:id", emissionTypeController.updateEmissionType);

// Delete an emission type
router.delete("/:id", emissionTypeController.deleteEmissionType);

module.exports = router;
