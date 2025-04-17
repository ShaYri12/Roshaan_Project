const express = require("express");
const router = express.Router();
const axios = require("axios");

// Proxy endpoint for vehicle data
router.get("/vehicle/:licensePlate", async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const response = await axios.get(
      `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${licensePlate}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error proxying vehicle data request:", error);
    res.status(500).json({
      error: "Failed to fetch vehicle data",
      details: error.message,
    });
  }
});

// Proxy endpoint for CO2 data
router.get("/co2/:licensePlate", async (req, res) => {
  try {
    const { licensePlate } = req.params;
    const response = await axios.get(
      `https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${licensePlate}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error proxying CO2 data request:", error);
    res.status(500).json({
      error: "Failed to fetch CO2 data",
      details: error.message,
    });
  }
});

module.exports = router;
