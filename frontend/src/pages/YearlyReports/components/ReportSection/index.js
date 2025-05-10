import React from "react";
import TotalEmissions from "./TotalEmissions";
import MonthlyDistribution from "./MonthlyDistribution";
import CategoryEmissions from "./CategoryEmissions";
import ReportSummary from "./ReportSummary";

const ReportSection = ({
  theme,
  reportData,
  savedReports,
  saveReport,
  exportPDF,
  isGeneratingPdf,
  monthlyEmissions,
  categoryEmissions,
  categoryEmissionsSeries,
  exportChartAsImage,
  reportRef,
}) => {
  if (!reportData) return null;

  return (
    <div className="row">
      <div className="col-12">
        <div
          className={`border-0 pt-2 pb-4 shadow-sm ${
            theme === "dark" ? "bg-dark text-light" : "bg-white"
          }`}
        >
          <div className="card-header bg-transparent border-0 py-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <h4 className="mb-0 fw-bold">
                <i className="fas fa-file-alt me-2 text-primary"></i>
                CO₂ Emissions Report for {reportData.year}
              </h4>
              <div className="d-flex mt-2 mt-md-0">
                {!savedReports.some(
                  (r) =>
                    (r.reportId === reportData.reportId ||
                      r._id === reportData._id) &&
                    r.year === reportData.year
                ) && (
                  <button
                    className="btn btn-success me-2 d-flex align-items-center"
                    onClick={saveReport}
                  >
                    <i className="fas fa-save me-2"></i>
                    Save Report
                  </button>
                )}
                <button
                  className="btn btn-success d-flex align-items-center"
                  onClick={exportPDF}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-pdf me-2"></i>
                      Export as PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="card-body" ref={reportRef}>
            <div className="row">
              <TotalEmissions theme={theme} reportData={reportData} />

              <MonthlyDistribution
                theme={theme}
                monthlyEmissions={monthlyEmissions}
                exportChartAsImage={exportChartAsImage}
              />
            </div>

            <div className="d-flex gap-4 flex-wrap">
              <CategoryEmissions
                theme={theme}
                categoryEmissions={categoryEmissions}
                categoryEmissionsSeries={categoryEmissionsSeries}
                exportChartAsImage={exportChartAsImage}
              />

              <ReportSummary theme={theme} reportData={reportData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSection;
