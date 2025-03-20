const express = require("express");
const router = express.Router();
const userEmissionController = require("../controllers/userEmissionController");

// Create a new emission entry
router.post("/", userEmissionController.createEmission);

// Get all emission entries for a user
router.get("/:userId", userEmissionController.getEmissionsByUser);

// Update an emission entry
router.put("/:id", userEmissionController.updateEmission);

// Delete an emission entry
router.delete("/:id", userEmissionController.deleteEmission);

module.exports = router;
