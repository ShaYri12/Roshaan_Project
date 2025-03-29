const Location = require("../models/Location");
const mongoose = require("mongoose");

// Get all locations with filtering options
exports.getLocations = async (req, res) => {
  try {
    const {
      user,
      company,
      type,
      search,
      sortBy = "name",
      sortOrder = "asc",
      limit = 20,
      page = 1,
    } = req.query;

    // Build query based on parameters
    const query = {};

    // Filter by user if provided
    if (user) {
      query.user = user;
    }

    // Filter by company if provided
    if (company) {
      query.company = company;
    }

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * parseInt(limit);

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Find locations with filtering and sorting
    const locations = await Location.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "firstName lastName email")
      .populate("company", "name address");

    // Count total documents for pagination
    const totalLocations = await Location.countDocuments(query);

    res.status(200).json({
      locations,
      pagination: {
        total: totalLocations,
        page: parseInt(page),
        pages: Math.ceil(totalLocations / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      message: "Error fetching locations",
      error: error.message,
    });
  }
};

// Get locations by proximity to coordinates
exports.getLocationsByProximity = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const locations = await Location.find({
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .populate("user", "firstName lastName email")
      .populate("company", "name address");

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error finding nearby locations:", error);
    res.status(500).json({
      message: "Error finding nearby locations",
      error: error.message,
    });
  }
};

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid location ID format" });
    }

    const location = await Location.findById(id)
      .populate("user", "firstName lastName email")
      .populate("company", "name address");

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({
      message: "Error fetching location",
      error: error.message,
    });
  }
};

// Create a new location
exports.createLocation = async (req, res) => {
  try {
    // Get user ID from request body, auth token, or a default value
    let userId = null;

    if (req.body && req.body.user) {
      userId = req.body.user;
    } else if (req.user && req.user._id) {
      userId = req.user._id;
    }

    // Create and save the new location
    const newLocation = new Location({
      ...req.body,
      user: userId,
    });

    await newLocation.save();

    // Return the created location
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("Error creating location:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(400).json({
      message: "Error creating location",
      error: error.message,
    });
  }
};

// Update a location
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid location ID format" });
    }

    const updatedLocation = await Location.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(updatedLocation);
  } catch (error) {
    console.error("Error updating location:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(400).json({
      message: "Error updating location",
      error: error.message,
    });
  }
};

// Toggle location favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid location ID format" });
    }

    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    location.isFavorite = !location.isFavorite;
    await location.save();

    res.status(200).json({
      message: `Location ${
        location.isFavorite ? "added to" : "removed from"
      } favorites`,
      isFavorite: location.isFavorite,
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    res.status(500).json({
      message: "Error toggling favorite status",
      error: error.message,
    });
  }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid location ID format" });
    }

    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({
      message: "Error deleting location",
      error: error.message,
    });
  }
};

// Get location types (for dropdown lists)
exports.getLocationTypes = async (req, res) => {
  try {
    // Get the enum values from the schema
    const locationTypes = Location.schema.path("type").enumValues;
    res.status(200).json(locationTypes);
  } catch (error) {
    console.error("Error fetching location types:", error);
    res.status(500).json({
      message: "Error fetching location types",
      error: error.message,
    });
  }
};
