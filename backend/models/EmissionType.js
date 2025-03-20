const mongoose = require("mongoose");

const EmissionTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  conversionFactor: { type: Number, required: true },
});

module.exports = mongoose.model("EmissionType", EmissionTypeSchema);
