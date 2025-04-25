const mongoose = require("mongoose");

const YearlyReportSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    totalEmissions: {
      type: Number,
      required: true,
    },
    monthlyData: {
      type: [Number],
      required: true,
      validate: {
        validator: function (array) {
          return array.length === 12; // Must have data for all 12 months
        },
        message: "Monthly data must contain 12 values (one for each month)",
      },
    },
    categoryData: {
      type: [Number],
      required: true,
    },
    categories: {
      type: [String],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // New fields for VSME compliance
    complianceStandards: {
      type: [
        {
          standard: String,
          compliant: Boolean,
          notes: String,
        },
      ],
      default: [],
    },
    // Target achievements
    targetAchievements: {
      type: [
        {
          targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Target",
          },
          name: String,
          targetYear: Number,
          baselineYear: Number,
          reductionGoal: Number,
          baselineEmissions: Number,
          actualReduction: Number,
          progressPercentage: Number,
          status: String,
          milestones: [
            {
              year: Number,
              targetReduction: Number,
              actualReduction: Number,
              status: String,
            },
          ],
        },
      ],
      default: [],
    },
    // Scenario outcomes
    scenarioOutcomes: {
      type: [
        {
          scenarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scenario",
          },
          name: String,
          description: String,
          startYear: Number,
          endYear: Number,
          baselineEmissions: Number,
          targetReduction: Number,
          actualReduction: Number,
          progressPercentage: Number,
          measures: [
            {
              name: String,
              estimatedReduction: Number,
              actualReduction: Number,
              status: String,
            },
          ],
        },
      ],
      default: [],
    },
    // Emission reduction calculations
    emissionCalculations: {
      type: {
        totalReductionAchieved: Number,
        percentageReductionFromBaseline: Number,
        averageMonthlyEmission: Number,
        yearOverYearChange: Number,
        projectedNextYearEmissions: Number,
      },
      default: {},
    },
    // References to original data sources for compliance and audit
    dataSources: {
      type: [
        {
          sourceType: String,
          sourceId: mongoose.Schema.Types.ObjectId,
          dataPoints: Number,
          dateRange: {
            start: Date,
            end: Date,
          },
        },
      ],
      default: [],
    },
    // Verification status for compliance
    verificationStatus: {
      type: {
        verified: {
          type: Boolean,
          default: false,
        },
        verifiedBy: String,
        verificationDate: Date,
        verificationMethod: String,
        verificationNotes: String,
      },
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("YearlyReport", YearlyReportSchema);
