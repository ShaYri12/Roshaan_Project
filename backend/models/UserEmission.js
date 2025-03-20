const mongoose = require("mongoose");

const EmissionEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    emissionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmissionType",
      required: true,
    },
    quantity: { type: Number, required: true },
    co2Equivalent: { type: Number, required: true },
    date: {
      type: Date,
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("UserEmission", EmissionEntrySchema);
