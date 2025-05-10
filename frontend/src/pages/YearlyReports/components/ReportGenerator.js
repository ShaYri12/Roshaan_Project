import React from "react";

const ReportGenerator = ({
  theme,
  years,
  selectedYear,
  setSelectedYear,
  generateReport,
  isLoading,
}) => {
  return (
    <div className="col-xl-4 col-lg-5 col-md-7 mb-4">
      <div
        className={`card m-0 m-0 p-0 h-100 border-0 shadow-sm ${
          theme === "dark" ? "bg-dark text-light" : "bg-white"
        }`}
      >
        <div className="card-header bg-transparent border-0 py-3">
          <h5 className="card-title fw-bold mb-0">
            <i className="fas fa-file-alt me-2 text-primary"></i>
            Generate New Report
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label htmlFor="yearSelect" className="form-label">
              <i className="fas fa-calendar-alt me-2"></i>
              Select Year
            </label>
            <select
              id="yearSelect"
              className={`form-select ${
                theme === "dark" ? "bg-dark text-light border-secondary" : ""
              }`}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center"
            onClick={generateReport}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt me-2"></i>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
