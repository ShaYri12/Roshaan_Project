const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "ton", "liter", "m²", "m³", "piece", "other"],
    },
    co2Value: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
    },
    description: {
      type: String,
    },
    materialType: {
      type: String,
    },
    origin: {
      type: String,
    },
    transportMethod: {
      type: String,
      enum: ["Road", "Sea", "Air", "Rail", "Multiple", "Unknown", ""],
    },
    productionYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    additionalInfo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
