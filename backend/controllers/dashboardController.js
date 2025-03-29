const Emission = require("../models/Emission");
const mongoose = require("mongoose");
const EnergyEmission = require("../models/EnergyEmission");

exports.redutionOverTime = async (req, res) => {
  try {
    const query = [
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total_emission: { $sum: "$co2Used" }, // Count documents per month
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
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
                  day: 1, // Dummy day value for formatting
                },
              },
            },
          },
          total_emission: 1,
        },
      },
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
          total_emissions: { $sum: "$co2Used" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total_emissions: 1,
        },
      },
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
          as: "category_info",
        },
      },
      { $unwind: "$category_info" },
      {
        $group: {
          _id: "$transportation",
          categoryTitle: { $first: "$category_info.name" },
          totalEmissions: { $sum: 1 },
        },
      },
      { $sort: { totalEmissions: -1 } },
      {
        $project: {
          _id: 0, // Exclude _id from the result
          categoryTitle: 1,
          totalEmissions: 1,
        },
      },
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
          totalEmissions: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by year in ascending order
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          totalEmissions: 1,
        },
      },
    ];

    const response = await Emission.aggregate(query);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get energy usage leaderboard (users with lowest emissions)
exports.getEnergyLeaderboard = async (req, res) => {
  try {
    // Get limit from query params or use default
    const limit = parseInt(req.query.limit) || 10;

    // Optionally filter by month/year if provided
    const { month, year } = req.query;

    // Build date filter for energy emissions
    const energyDateFilter = {};
    // Build date filter for transport emissions
    const transportDateFilter = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1); // Month is 0-based in JS Date
      const endDate = new Date(year, month, 0); // Last day of the month
      energyDateFilter.startDate = { $gte: startDate, $lte: endDate };
      transportDateFilter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      // If only year is provided, filter for the entire year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      energyDateFilter.startDate = { $gte: startDate, $lte: endDate };
      transportDateFilter.date = { $gte: startDate, $lte: endDate };
    }

    // Get transport emissions by user
    const transportEmissions = await Emission.aggregate([
      {
        $match: transportDateFilter,
      },
      {
        $lookup: {
          from: "users",
          localField: "employee", // assuming this links to a user
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$employee",
          userDetails: { $first: "$user" },
          totalEmissions: { $sum: { $ifNull: ["$co2Used", 0] } },
          emissionCount: { $sum: 1 },
        },
      },
    ]);

    // Get energy emissions by user
    const energyEmissions = await EnergyEmission.aggregate([
      {
        $match: energyDateFilter,
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          totalEmission: {
            $reduce: {
              input: "$energySources",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $cond: {
                      if: { $eq: [{ $type: "$$this.emission" }, "string"] },
                      then: { $toDouble: "$$this.emission" },
                      else: { $ifNull: ["$$this.emission", 0] },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$userId",
          userDetails: { $first: "$user" },
          totalEmissions: { $sum: "$totalEmission" },
          emissionCount: { $sum: 1 },
        },
      },
    ]);

    // Combine emissions data from both sources
    const combinedEmissionsMap = new Map();

    // Process transport emissions
    transportEmissions.forEach((item) => {
      if (!item._id) return; // Skip entries with no user ID

      const userId = item._id.toString();
      const user = {
        userId: userId,
        firstName: item.userDetails?.firstName || "Unknown",
        lastName: item.userDetails?.lastName || "User",
        email: item.userDetails?.email || "",
        totalEmissions: item.totalEmissions || 0,
        emissionCount: item.emissionCount || 0,
      };

      combinedEmissionsMap.set(userId, user);
    });

    // Process energy emissions and merge with transport emissions
    energyEmissions.forEach((item) => {
      if (!item._id) return; // Skip entries with no user ID

      const userId = item._id.toString();
      const existingUser = combinedEmissionsMap.get(userId);

      if (existingUser) {
        // Update existing user data
        existingUser.totalEmissions += item.totalEmissions || 0;
        existingUser.emissionCount += item.emissionCount || 0;
      } else {
        // Add new user entry
        const user = {
          userId: userId,
          firstName: item.userDetails?.firstName || "Unknown",
          lastName: item.userDetails?.lastName || "User",
          email: item.userDetails?.email || "",
          totalEmissions: item.totalEmissions || 0,
          emissionCount: item.emissionCount || 0,
        };

        combinedEmissionsMap.set(userId, user);
      }
    });

    // Convert map to array and add averages
    let leaderboardData = Array.from(combinedEmissionsMap.values()).map(
      (user) => ({
        ...user,
        averageEmission:
          user.emissionCount > 0 ? user.totalEmissions / user.emissionCount : 0,
      })
    );

    // Sort by lowest total emissions
    leaderboardData.sort((a, b) => a.totalEmissions - b.totalEmissions);

    // Apply limit
    leaderboardData = leaderboardData.slice(0, limit);

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error("Error fetching energy leaderboard:", error);
    res.status(500).json({
      message: "Error fetching energy leaderboard",
      error: error.message,
    });
  }
};
