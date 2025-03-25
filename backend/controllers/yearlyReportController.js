const YearlyReport = require("../models/YearlyReport");
const Emission = require("../models/Emission");
const EnergyEmission = require("../models/EnergyEmission");

// Generate a yearly report based on emissions data
exports.generateReport = async (req, res) => {
  try {
    const { year, userId } = req.body;

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    // Get userId from multiple sources
    let userIdToUse = userId;

    // If userId wasn't provided in the body, try to get it from the auth token
    if (!userIdToUse && req.user && req.user._id) {
      userIdToUse = req.user._id;
      console.log("Using userId from auth token:", userIdToUse);
    }

    if (!userIdToUse) {
      return res.status(400).json({
        message: "User ID is required. Please check your authentication.",
      });
    }

    // Check if report for this year already exists
    const existingReport = await YearlyReport.findOne({
      year,
      user: userIdToUse,
    });
    if (existingReport) {
      return res.status(200).json(existingReport);
    }

    // Generate a unique report ID
    const reportId = `REP-${year}-${Math.floor(Math.random() * 10000)}`;

    // Get start and end dates for the year
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st of the year

    // Gather all transportation emissions for the year
    const transportEmissions = await Emission.find({
      user: userIdToUse,
      date: { $gte: startDate, $lte: endDate },
    });

    // Gather all energy emissions for the year
    const energyEmissions = await EnergyEmission.find({
      userId: userIdToUse,
      startDate: { $gte: startDate, $lte: endDate },
    });

    // Initialize arrays for monthly data
    const monthlyData = Array(12).fill(0);

    // Calculate monthly emissions from transportation
    transportEmissions.forEach((emission) => {
      const month = new Date(emission.date).getMonth();
      monthlyData[month] += emission.co2Used || 0;
    });

    // Calculate monthly emissions from energy
    energyEmissions.forEach((emission) => {
      const month = new Date(emission.startDate).getMonth();

      // Process energy sources if they exist
      if (emission.energySources && Array.isArray(emission.energySources)) {
        emission.energySources.forEach((source) => {
          try {
            // Handle if energySource is stored as a string
            if (typeof source === "string") {
              const parsedSource = JSON.parse(source);
              monthlyData[month] += parseFloat(parsedSource.emission) || 0;
            } else {
              monthlyData[month] += parseFloat(source.emission) || 0;
            }
          } catch (error) {
            console.error("Error processing energy source:", error);
          }
        });
      }
    });

    // Calculate total emissions
    const totalEmissions = monthlyData.reduce((sum, value) => sum + value, 0);

    // Calculate emissions by category (Transportation, Energy, etc.)
    let transportationTotal = 0;
    let energyTotal = 0;
    let otherTotal = 0;

    // Sum up transportation emissions
    transportEmissions.forEach((emission) => {
      transportationTotal += emission.co2Used || 0;
    });

    // Sum up energy emissions
    energyEmissions.forEach((emission) => {
      if (emission.energySources && Array.isArray(emission.energySources)) {
        emission.energySources.forEach((source) => {
          try {
            if (typeof source === "string") {
              const parsedSource = JSON.parse(source);
              energyTotal += parseFloat(parsedSource.emission) || 0;
            } else {
              energyTotal += parseFloat(source.emission) || 0;
            }
          } catch (error) {
            console.error("Error processing energy source:", error);
          }
        });
      }
    });

    // Create the yearly report
    const yearlyReport = new YearlyReport({
      year,
      reportId,
      totalEmissions,
      monthlyData,
      categoryData: [transportationTotal, energyTotal, otherTotal],
      categories: ["Transportation", "Energy", "Other"],
      user: userIdToUse,
      createdAt: new Date(),
    });

    await yearlyReport.save();

    res.status(201).json(yearlyReport);
  } catch (error) {
    console.error("Error generating yearly report:", error);
    res.status(500).json({
      message: "Error generating yearly report",
      error: error.message,
    });
  }
};

// Get all yearly reports for a user
exports.getAllReports = async (req, res) => {
  try {
    // Get userId from multiple sources
    let userId = req.query.userId;

    // If no userId in query, try from token
    if (!userId && req.user && req.user._id) {
      userId = req.user._id;
    }

    const query = {};
    if (userId) {
      query.user = userId;
    }

    const reports = await YearlyReport.find(query).sort({ year: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching yearly reports:", error);
    res
      .status(500)
      .json({ message: "Error fetching yearly reports", error: error.message });
  }
};

// Get a specific yearly report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await YearlyReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching yearly report:", error);
    res
      .status(500)
      .json({ message: "Error fetching yearly report", error: error.message });
  }
};

// Get a yearly report by year and user
exports.getReportByYear = async (req, res) => {
  try {
    const { year } = req.params;

    // Get userId from multiple sources
    let userId = req.query.userId;

    // If no userId in query, try from token
    if (!userId && req.user && req.user._id) {
      userId = req.user._id;
    }

    if (!userId) {
      return res.status(400).json({
        message:
          "User ID is required. Check authentication or provide userId parameter.",
      });
    }

    const report = await YearlyReport.findOne({ year, user: userId });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching yearly report:", error);
    res
      .status(500)
      .json({ message: "Error fetching yearly report", error: error.message });
  }
};

// Delete a yearly report
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Attempting to delete report with ID:", id);

    // Try to find by MongoDB ID or reportId
    let report = null;

    // Check if it's a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await YearlyReport.findByIdAndDelete(id);
    } else {
      // If not a valid ObjectId, try by reportId
      report = await YearlyReport.findOneAndDelete({ reportId: id });
    }

    if (!report) {
      console.log("Report not found for deletion:", id);
      return res.status(404).json({ message: "Report not found" });
    }

    console.log("Report deleted successfully:", report._id, report.reportId);
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting yearly report:", error);
    res.status(500).json({
      message: "Error deleting yearly report",
      error: error.message,
    });
  }
};
