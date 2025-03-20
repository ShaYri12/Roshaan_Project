const EnergyEmission = require("../models/EnergyEmission");


// ✅ Get all emissions for a specific user and month
exports.getAll = async (req, res) => {
    try {
        const emission = await EnergyEmission.find();

        if (!emission) return res.status(404).json({ message: "No data found" });

        res.json(emission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// ✅ Create a new energy emission record
exports.createEnergyEmission = async (req, res) => {
    try {
        const { userId, startDate, endDate, energySources } = req.body;

        if (!userId || !startDate || !energySources.length) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Ensure energySources is parsed into an array of objects
        if (typeof energySources === "string") {
            energySources = JSON.parse(energySources);
        }

        const emission = new EnergyEmission({ userId, startDate, endDate, energySources });

        await emission.save();
        res.status(201).json({ message: "Energy emission saved successfully", emission });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Get emissions for a specific user and month
exports.getEnergyEmission = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.params;
        const emission = await EnergyEmission.findOne({ userId, startDate, endDate });

        if (!emission) return res.status(404).json({ message: "No data found" });

        res.json(emission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Update an existing record
exports.updateEnergyEmission = async (req, res) => {
    try {
        const updatedEmission = await EnergyEmission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedEmission) return res.status(404).json({ message: "Record not found" });

        res.json(updatedEmission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// DELETE route to remove an energy emission record by ID
exports.deleteEnergyEmission = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const deletedRecord = await EnergyEmission.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res
                .status(404)
                .json({ message: "Energy Emission record not found" });
        }

        res.status(200).json({
            message: "Record deleted successfully!",
        });
    } catch (error) {
        // throw new Error(error.message);
        console.error(error);
        res
            .status(500)
            .json({ message: "Error deleting Work Energy Emission record" });
    }
};
