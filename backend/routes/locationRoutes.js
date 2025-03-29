const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all locations with filtering
router.get("/", authMiddleware, locationController.getLocations);

// Get location types for dropdowns
router.get("/types", locationController.getLocationTypes);

// Get locations by proximity (requires lat and lng query params)
router.get(
  "/nearby",
  authMiddleware,
  locationController.getLocationsByProximity
);

// Get a single location by ID
router.get("/:id", authMiddleware, locationController.getLocationById);

// Create a new location
router.post("/", authMiddleware, locationController.createLocation);

// Update a location
router.put("/:id", authMiddleware, locationController.updateLocation);

// Toggle favorite status
router.patch(
  "/:id/favorite",
  authMiddleware,
  locationController.toggleFavorite
);

// Delete a location
router.delete("/:id", authMiddleware, locationController.deleteLocation);

module.exports = router;
