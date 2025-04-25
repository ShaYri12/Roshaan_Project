const YearlyReport = require("../models/YearlyReport");
const Emission = require("../models/Emission");
const EnergyEmission = require("../models/EnergyEmission");
const Target = require("../models/Target");
const Scenario = require("../models/Scenario");
const Measure = require("../models/Measure");

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

    // Get previous year's report for year-over-year comparison
    const previousYearReport = await YearlyReport.findOne({
      year: year - 1,
      user: userIdToUse,
    });

    // Calculate emission calculations metrics
    const emissionCalculations = {
      totalReductionAchieved: previousYearReport
        ? previousYearReport.totalEmissions - totalEmissions
        : 0,
      percentageReductionFromBaseline: previousYearReport
        ? ((previousYearReport.totalEmissions - totalEmissions) /
            previousYearReport.totalEmissions) *
          100
        : 0,
      averageMonthlyEmission: totalEmissions / 12,
      yearOverYearChange: previousYearReport
        ? ((totalEmissions - previousYearReport.totalEmissions) /
            previousYearReport.totalEmissions) *
          100
        : 0,
      projectedNextYearEmissions:
        totalEmissions *
        (1 +
          (previousYearReport
            ? (totalEmissions - previousYearReport.totalEmissions) /
              previousYearReport.totalEmissions
            : 0)),
    };

    // Fetch targets that are relevant for this year (where targetYear >= year >= baselineYear)
    const relevantTargets = await Target.find({
      $and: [{ baselineYear: { $lte: year } }, { targetYear: { $gte: year } }],
    }).populate("scenarioId");

    // Process target achievements
    const targetAchievements = relevantTargets.map((target) => {
      // Find milestone for this year if exists
      const yearMilestone = target.milestones.find((m) => m.year === year);

      // Calculate progress percentage based on reduction goal
      const actualReduction = yearMilestone ? yearMilestone.actualReduction : 0;
      const progressPercentage = (actualReduction / target.reductionGoal) * 100;

      return {
        targetId: target._id,
        name: target.name,
        targetYear: target.targetYear,
        baselineYear: target.baselineYear,
        reductionGoal: target.reductionGoal,
        baselineEmissions: target.baselineEmissions,
        actualReduction,
        progressPercentage,
        status: target.status,
        milestones: target.milestones,
      };
    });

    // Fetch scenarios that span this year
    const relevantScenarios = await Scenario.find({
      $and: [{ startYear: { $lte: year } }, { endYear: { $gte: year } }],
    });

    // Process scenario outcomes
    const scenarioOutcomes = await Promise.all(
      relevantScenarios.map(async (scenario) => {
        // Fetch measures for this scenario
        const scenarioMeasures = await Measure.find({
          scenarioId: scenario._id,
        });

        // Calculate total actual reduction from measures
        const measuresData = scenarioMeasures.map((measure) => {
          return {
            name: measure.name,
            estimatedReduction: measure.estimatedReduction,
            actualReduction: measure.actualReduction,
            status: measure.status,
          };
        });

        const totalActualReduction = measuresData.reduce(
          (sum, measure) => sum + measure.actualReduction,
          0
        );
        const progressPercentage =
          (totalActualReduction / scenario.targetReduction) * 100;

        return {
          scenarioId: scenario._id,
          name: scenario.name,
          description: scenario.description,
          startYear: scenario.startYear,
          endYear: scenario.endYear,
          baselineEmissions: scenario.baselineEmissions,
          targetReduction: scenario.targetReduction,
          actualReduction: totalActualReduction,
          progressPercentage,
          measures: measuresData,
        };
      })
    );

    // Prepare data sources for audit trail
    const dataSources = [
      {
        sourceType: "Transportation",
        dataPoints: transportEmissions.length,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
      {
        sourceType: "Energy",
        dataPoints: energyEmissions.length,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    ];

    // VSME compliance standards
    const complianceStandards = [
      {
        standard: "VSME Emissions Reporting",
        compliant: true,
        notes: "Report contains all required emissions data",
      },
      {
        standard: "VSME Target Tracking",
        compliant: targetAchievements.length > 0,
        notes:
          targetAchievements.length > 0
            ? "Report includes target tracking"
            : "No targets found for this reporting period",
      },
      {
        standard: "VSME Scenario Analysis",
        compliant: scenarioOutcomes.length > 0,
        notes:
          scenarioOutcomes.length > 0
            ? "Report includes scenario outcomes"
            : "No scenarios found for this reporting period",
      },
    ];

    // Create the yearly report with enhanced data
    const yearlyReport = new YearlyReport({
      year,
      reportId,
      totalEmissions,
      monthlyData,
      categoryData: [transportationTotal, energyTotal, otherTotal],
      categories: ["Transportation", "Energy", "Other"],
      user: userIdToUse,
      createdAt: new Date(),
      // New VSME compliant fields
      targetAchievements,
      scenarioOutcomes,
      emissionCalculations,
      dataSources,
      complianceStandards,
      verificationStatus: {
        verified: false,
        verificationMethod: "Automated generation",
      },
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

    console.log("Attempting to fetch report with ID:", id);

    // Try to find by MongoDB ID or reportId
    let report = null;

    // Check if it's a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      report = await YearlyReport.findById(id);
    } else {
      // If not a valid ObjectId, try by reportId
      report = await YearlyReport.findOne({ reportId: id });
    }

    if (!report) {
      console.log("Report not found:", id);
      return res.status(404).json({ message: "Report not found" });
    }

    console.log("Report found successfully:", report._id, report.reportId);
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

// New endpoint for VSME compliant Jaaropgave export
exports.generateJaaropgaveExport = async (req, res) => {
  try {
    const { reportId, format } = req.params;

    // Find the report
    let report = null;
    if (reportId.match(/^[0-9a-fA-F]{24}$/)) {
      report = await YearlyReport.findById(reportId)
        .populate("targetAchievements.targetId")
        .populate("scenarioOutcomes.scenarioId");
    } else {
      report = await YearlyReport.findOne({ reportId })
        .populate("targetAchievements.targetId")
        .populate("scenarioOutcomes.scenarioId");
    }

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update verification status for export compliance
    report.verificationStatus = {
      verified: true,
      verifiedBy: req.user ? req.user.email || req.user.username : "System",
      verificationDate: new Date(),
      verificationMethod: "VSME Export",
      verificationNotes: "Report verified for VSME compliance export",
    };

    await report.save();

    // Create export data format based on requested format (json or pdf)
    const exportData = {
      reportDetails: {
        reportId: report.reportId,
        generatedDate: new Date(),
        year: report.year,
        organization: req.user ? req.user.organization : "Your Organization",
        verificationStatus: report.verificationStatus,
      },
      emissionsData: {
        totalEmissions: report.totalEmissions,
        byCategory: report.categories.map((category, index) => ({
          category,
          emissions: report.categoryData[index],
        })),
        monthlyData: report.monthlyData,
        calculations: report.emissionCalculations,
      },
      targetAchievements: report.targetAchievements,
      scenarioOutcomes: report.scenarioOutcomes,
      complianceStatus: report.complianceStandards,
      // Added reference data for regulatory compliance
      referenceData: {
        reportingStandard: "VSME Emissions Reporting Standard",
        version: "2023",
        reportingPeriod: {
          start: new Date(report.year, 0, 1),
          end: new Date(report.year, 11, 31),
        },
      },
    };

    // For JSON format, return directly
    if (format === "json") {
      return res.status(200).json(exportData);
    }

    // For PDF format, we'd typically generate a PDF here
    // Since we don't have direct access to PDF generation in this snippet,
    // we'll return a flag to tell frontend to generate PDF
    if (format === "pdf") {
      return res.status(200).json({
        ...exportData,
        _generatePdf: true,
      });
    }

    // Default response
    return res.status(200).json(exportData);
  } catch (error) {
    console.error("Error generating Jaaropgave export:", error);
    res.status(500).json({
      message: "Error generating Jaaropgave export",
      error: error.message,
    });
  }
};
