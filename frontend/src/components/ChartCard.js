import React from "react";
import Chart from "react-apexcharts";

const ChartCard = ({
  theme,
  chartRef,
  options,
  series,
  type,
  height = 350,
  className = "",
}) => {
  return (
    <div
      className={`card m-0 shadow-lg h-100 bg-${theme} text-${
        theme === "light" ? "dark" : "light"
      } rounded-3 ${className}`}
    >
      <div className="text-center">
        <div className="report-chart position-relative">
          <div className="chart-container" ref={chartRef}>
            <Chart
              className="mt-2"
              options={options}
              series={series}
              type={type}
              height={height}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
