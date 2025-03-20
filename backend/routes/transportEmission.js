const express = require("express");
const router = express.Router();
const {
  createTransportEmission,
  getAll,
  getTransportEmission,
  updateTransportEmission,
  deleteTransportEmission
} = require("../controllers/transportEmissionController");

// ✅ Routes
router.get("/:userId", getAll);
router.post("/", createTransportEmission);
router.get("/:userId/:year/:month", getTransportEmission);
router.put("/:id", updateTransportEmission);
router.delete("/:id", deleteTransportEmission);

module.exports = router;
