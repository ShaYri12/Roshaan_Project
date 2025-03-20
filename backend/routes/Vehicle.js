const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/VehicleController");
const isAdmin = require("../middleware/authMiddleware"); // Ensure you have authentication middleware
const authMiddleware =require('./../middleware/authMiddleware')
// 🚗 Get all vehicles (Admin Only)
router.get("/", vehicleController.getVehicles);

// 🚗 Get vehicle by ID (User can access their own, Admin can access any)
router.get("/:id",authMiddleware, vehicleController.getVehicleById);

// 🚗 Mark vehicle as favorite (User Feature)
router.post("/:id/favorite", vehicleController.markFavorite);

// 🚗 Create a vehicle (User can register their own)
router.post("/", vehicleController.createVehicle);

// 🚗 Update vehicle (User can update their own, Admin can update any)
router.put("/:id", vehicleController.updateVehicle);

// 🚗 Delete vehicle (Admin can delete any, User can delete their own)
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
