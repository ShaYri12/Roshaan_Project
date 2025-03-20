const express = require("express");
const router = express.Router();
const transportationController = require("../controllers/transportationController");

// Get all transportation records
router.get("/", transportationController.getTransportations);

// Get a transportation record by ID
router.get("/:id", transportationController.getTransportationById);

// Create a new transportation record
router.post("/", transportationController.createTransportation);

// Update a transportation record
router.put("/:id", transportationController.updateTransportation);

// Delete a transportation record
router.delete("/:id", transportationController.deleteTransportation);

module.exports = router;
