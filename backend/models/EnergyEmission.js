const mongoose = require("mongoose");

const energyEmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // month: { type: Number, required: true }, // 1-12
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Optional
    // year: { type: Number, required: true },
    energySources: [
      {
        type: String, // e.g., Electricity, Gas, Solar
        emission: Number, // CO₂ emission in kg
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnergyEmission", energyEmissionSchema);
