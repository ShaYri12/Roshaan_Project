import React from "react";
import ChartCard from "./ChartCard";

const CO2ReductionChart = ({ theme, chartRef, options, series }) => {
  return (
    <div className="col-lg-6">
      <ChartCard
        theme={theme}
        chartRef={chartRef}
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default CO2ReductionChart;
