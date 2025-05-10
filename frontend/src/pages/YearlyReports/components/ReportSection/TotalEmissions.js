import React from "react";

const TotalEmissions = ({ theme, reportData }) => {
  return (
    <div className="col-md-4 mb-4">
      <div
        className={`card m-0 h-100 border-0 ${
          theme === "dark" ? "bg-dark-secondary text-light" : "bg-light"
        }`}
      >
        <div className="card-body text-center py-4">
          <h5 className="card-title fw-bold text-primary mb-4">
            <i className="fas fa-calculator me-2"></i>
            Total Emissions
          </h5>

          <div
            className={`emission-gauge mx-auto mb-3 mt-2 position-relative d-flex align-items-center justify-content-center rounded-circle ${
              reportData.totalEmissions > 200
                ? "bg-danger"
                : reportData.totalEmissions > 100
                ? "bg-warning"
                : "bg-success"
            }`}
            style={{ width: "150px", height: "150px" }}
          >
            <div
              className={`rounded-circle bg-${
                theme === "dark" ? "dark" : "white"
              } d-flex align-items-center justify-content-center`}
              style={{ width: "120px", height: "120px" }}
            >
              <div>
                <div className="display-6 fw-bold mb-0">
                  {reportData.totalEmissions}
                </div>
                <small className="text-muted">TONNES</small>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between mb-2">
              <span className="badge bg-success">Low</span>
              <span className="badge bg-warning">Medium</span>
              <span className="badge bg-danger">High</span>
            </div>
            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-success"
                style={{ width: "33%" }}
              ></div>
              <div
                className="progress-bar bg-warning"
                style={{ width: "33%" }}
              ></div>
              <div
                className="progress-bar bg-danger"
                style={{ width: "34%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalEmissions;
