import React from "react";
import Chart from "react-apexcharts";

const CategoryEmissions = ({
  theme,
  categoryEmissions,
  categoryEmissionsSeries,
  exportChartAsImage,
}) => {
  return (
    <div className="flex-fill mb-4">
      <div
        className={`card m-0 h-100 border-0 ${
          theme === "dark" ? "bg-dark-secondary text-light" : "bg-light"
        }`}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title fw-bold text-primary mb-0">
              <i className="fas fa-chart-pie me-2"></i>
              Emissions by Category
            </h5>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() =>
                exportChartAsImage(
                  "category-emissions-chart",
                  "Category-CO2-Emissions"
                )
              }
              title="Download chart"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
          <div
            className="category-emissions-chart"
            id="category-emissions-chart"
          >
            <Chart
              options={categoryEmissions}
              series={categoryEmissionsSeries}
              type="donut"
              height={320}
              width="100%"
              className="w-100 d-flex justify-content-center align-items-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryEmissions;
