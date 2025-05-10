import React from "react";
import Chart from "react-apexcharts";

const MonthlyDistribution = ({
  theme,
  monthlyEmissions,
  exportChartAsImage,
}) => {
  return (
    <div className="col-md-8 mb-4">
      <div
        className={`card m-0 h-100 border-0 ${
          theme === "dark" ? "bg-dark-secondary text-light" : "bg-light"
        }`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title fw-bold text-primary mb-0">
              <i className="fas fa-chart-line me-2"></i>
              Monthly Distribution
            </h5>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() =>
                exportChartAsImage(
                  "monthly-emissions-chart",
                  "Monthly-CO2-Emissions"
                )
              }
              title="Download chart"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
          <div className="monthly-emissions-chart" id="monthly-emissions-chart">
            <Chart
              options={monthlyEmissions}
              series={monthlyEmissions.series}
              type="area"
              height={320}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDistribution;
