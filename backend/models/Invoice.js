const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["energy", "water", "gas", "other"],
      required: true,
    },
    emissionTypes: {
      type: [String],
      enum: ["energy", "water", "gas", "other"],
      default: [],
    },
    co2Emissions: {
      type: Number,
      default: 0,
    },
    emissionBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    emissionsUnit: {
      type: String,
      default: "kg",
    },
    aiAnalysis: {
      type: String,
    },
    rawText: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consumption: {
      type: String,
    },
    consumptionUnit: {
      type: String,
    },
    emissionFactor: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
