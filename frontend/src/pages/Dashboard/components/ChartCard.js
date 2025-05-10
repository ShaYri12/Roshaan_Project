import React from "react";
import Chart from "react-apexcharts";

/**
 * ChartCard - A reusable component that wraps a chart in a card with consistent styling
 *
 * @param {Object} props
 * @param {string} props.theme - The current theme (light/dark)
 * @param {Object} props.options - The ApexCharts options configuration
 * @param {Array|Object} props.series - The data series for the chart
 * @param {string} props.type - The type of chart (line, bar, pie, etc.)
 * @param {number} props.height - The height of the chart in pixels
 * @param {React.RefObject} props.chartRef - Reference to the chart container for PDF export
 * @returns {JSX.Element}
 */
const ChartCard = ({ theme, options, series, type, height, chartRef }) => {
  return (
    <div
      className={`card m-0 shadow-lg h-100 bg-${theme} text-${
        theme === "light" ? "dark" : "light"
      } rounded-3`}
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
