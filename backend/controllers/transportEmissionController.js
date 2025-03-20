const TransportEmission = require("../models/TransportEmission");


// ✅ Create a new Transport Emission record
exports.createTransportEmission = async (req, res) => {
    try {
        const { userId, month, year, transportMode, distance, weight, emissionFactor } = req.body;

        if (!userId || !month || !year || !transportMode || !distance || !weight || !emissionFactor) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const transportEmission = new TransportEmission({ userId, month, year, transportMode, distance, weight, emissionFactor });

        await transportEmission.save();
        res.status(201).json({ message: "Transport Emission saved successfully", transportEmission });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Get all emissions for a specific user and month
exports.getAll = async (req, res) => {
    try {

        const { userId } = req.params;
        const transportEmission = await TransportEmission.find({ userId }).sort({ year: -1, month: -1 });

        if (!transportEmission) return res.status(404).json({ message: "No data found" });

        res.json(transportEmission);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Get transportEmission for a specific user and month
exports.getTransportEmission = async (req, res) => {
    try {
        const { userId, year, month } = req.params;
        const transportEmission = await TransportEmission.findOne({ userId, year, month });

        if (!transportEmission) return res.status(404).json({ message: "No data found" });

        res.json(transportEmission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Update an existing record
exports.updateTransportEmission = async (req, res) => {
    try {
        const updatedTransportEmission = await TransportEmission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedTransportEmission) return res.status(404).json({ message: "Record not found" });

        res.json(updatedTransportEmission);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// DELETE route to remove an Transport Emission record by ID
exports.deleteTransportEmission = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const deletedRecord = await TransportEmission.findByIdAndDelete(id);
        if (!deletedRecord) {
            return res
                .status(404)
                .json({ message: "Transport Emission record not found" });
        }

        res.status(200).json({
            message: "Record deleted successfully!",
        });
    } catch (error) {
        // throw new Error(error.message);
        console.error(error);
        res
            .status(500)
            .json({ message: "Error deleting Work Transport Emission record" });
    }
};