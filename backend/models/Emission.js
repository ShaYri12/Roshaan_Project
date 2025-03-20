const mongoose = require("mongoose");

const emissionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    startLocation: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    endLocation: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    transportation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transportation",
    },
    distance: { type: Number, required: true },
    co2Used: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emission", emissionSchema);
