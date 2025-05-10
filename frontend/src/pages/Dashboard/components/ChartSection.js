import React from "react";
import CO2ReductionChart from "./CO2ReductionChart";
import CO2EmissionsByDateChart from "./CO2EmissionsByDateChart";
import CO2EmissionsByCategoryChart from "./CO2EmissionsByCategoryChart";
import CO2EmissionsTrendChart from "./CO2EmissionsTrendChart";

/**
 * ChartSection - Renders all chart components with layout and download button
 */
const ChartSection = ({
  theme,
  co2ReductionRef,
  co2EmissionsByDateRef,
  co2EmissionsByCategoryRef,
  co2EmissionsTrendRef,
  co2Reduction,
  co2EmissionsByDate,
  co2EmissionsByDateSeries,
  co2EmissionsByCategory,
  co2EmissionsByCategorySeries,
  co2EmissionsTrend,
  isGeneratingPDF,
  downloadAllPDFs,
}) => {
  return (
    <>
      {/* Download PDF button */}
      <div className="row">
        <div className="col-12 mt-3">
          <button
            onClick={downloadAllPDFs}
            className="btn btn-success float-end mx-3 mt-3"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Generating PDF...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf"></i> Download All Graphs
              </>
            )}
          </button>
        </div>
      </div>

      {/* First row of charts */}
      <div className="row mt-3 mb-3">
        <CO2ReductionChart
          theme={theme}
          chartRef={co2ReductionRef}
          options={co2Reduction}
          series={co2Reduction.series}
        />

        <CO2EmissionsByDateChart
          theme={theme}
          chartRef={co2EmissionsByDateRef}
          options={co2EmissionsByDate}
          series={co2EmissionsByDateSeries}
        />
      </div>

      {/* Second row of charts */}
      <div className="row mb-4">
        <CO2EmissionsByCategoryChart
          theme={theme}
          chartRef={co2EmissionsByCategoryRef}
          options={co2EmissionsByCategory}
          series={co2EmissionsByCategorySeries}
        />

        <CO2EmissionsTrendChart
          theme={theme}
          chartRef={co2EmissionsTrendRef}
          options={co2EmissionsTrend}
          series={co2EmissionsTrend.series}
        />
      </div>
    </>
  );
};

export default ChartSection;
