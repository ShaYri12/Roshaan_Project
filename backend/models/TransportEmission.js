const mongoose = require("mongoose");

const TransportEmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  transportMode: { type: String, required: true, enum: ["Truck", "Train", "Ship", "Airplane"] },
  distance: { type: Number, required: true }, // in kilometers
  weight: { type: Number, required: true }, // in tons
  emissionFactor: { type: Number, required: true }, // kg CO2 per ton-km
  totalEmissions: { type: Number }, // Automatically calculated
});

TransportEmissionSchema.pre("save", function (next) {
  this.totalEmissions = this.distance * this.weight * this.emissionFactor;
  next();
});

module.exports = mongoose.model("TransportEmission", TransportEmissionSchema);
