const Emission = require("../models/Emission");
const mongoose = require("mongoose");

exports.redutionOverTime = async (req, res) => {
    try {
        const query = [
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    total_emission: { $sum: "$co2Used" } // Count documents per month
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
            },
            {
                $project: {
                    _id: 0, // Remove _id field
                    date: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: 1 // Dummy day value for formatting
                                }
                            }
                        }
                    },
                    total_emission: 1
                }
            }
        ];


        const response = await Emission.aggregate(query);
        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.emissionsByDate = async (req, res) => {
    try {
        const query = [
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total_emissions: { $sum: "$co2Used" }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    total_emissions: 1
                }
            }
        ];


        const response = await Emission.aggregate(query);
        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.emissionsByCategory = async (req, res) => {
    try {
        const query = [
            {
                $lookup: {
                    from: "transportations",
                    localField: "transportation",
                    foreignField: "_id",
                    as: "category_info"
                }
            },
            { $unwind: "$category_info" },
            {
                $group: {
                    _id: "$transportation",
                    categoryTitle: { $first: "$category_info.name" },
                    totalEmissions: { $sum: 1 }
                }
            },
            { $sort: { totalEmissions: -1 } },
            {
                $project: {
                    _id: 0, // Exclude _id from the result
                    categoryTitle: 1,
                    totalEmissions: 1
                }
            }
        ];
        const response = await Emission.aggregate(query);
        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.emissionsTrend = async (req, res) => {
    try {
        const query = [
            {
                $group: {
                    _id: { $year: "$date" }, // Extract year from the date
                    totalEmissions: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // Sort by year in ascending order
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id",
                    totalEmissions: 1
                }
            }
        ];
        
        const response = await Emission.aggregate(query);
        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
