import React from "react";

const SavedReportsTable = ({
  theme,
  savedReports,
  loadReport,
  openJaaropgaveExport,
  confirmDeleteReport,
}) => {
  return (
    <div className="col-md-12 mb-4">
      <div
        className={`card m-0 m-0 p-0 h-100 border-0 shadow-sm ${
          theme === "dark" ? "bg-dark text-light" : "bg-white"
        }`}
      >
        <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title fw-bold mb-0">
            <i className="fas fa-save me-2 text-primary"></i>
            Saved Reports
          </h5>
          <span className="badge bg-primary rounded-pill">
            {savedReports.length}
          </span>
        </div>
        <div className="card-body">
          {savedReports.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="fas fa-folder-open text-muted mb-3"
                style={{ fontSize: "48px" }}
              ></i>
              <p className="text-muted mb-0">
                No saved reports yet. Generate and save your first report!
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table
                className={`table table-hover ${
                  theme === "dark" ? "table-dark" : ""
                }`}
              >
                <thead>
                  <tr>
                    <th>
                      <i className="fas fa-id-card m-0 me-2"></i>Report ID
                    </th>
                    <th>
                      <i className="fas fa-calendar me-2"></i>Year
                    </th>
                    <th>
                      <i className="fas fa-clock me-2"></i>Date Created
                    </th>
                    <th>
                      <i className="fas fa-chart-pie me-2"></i>Total Emissions
                    </th>
                    <th className="text-center">
                      <i className="fas fa-cogs me-2"></i>Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {savedReports.map((report) => (
                    <tr key={report.reportId || report._id}>
                      <td>
                        <span className="badge bg-light text-dark">
                          {(report.reportId || report._id).substring(0, 8)}
                          ...
                        </span>
                      </td>
                      <td>{report.year}</td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span
                            className={`badge ${
                              report.totalEmissions > 200
                                ? "bg-danger"
                                : report.totalEmissions > 100
                                ? "bg-warning"
                                : "bg-success"
                            } me-2`}
                          >
                            {report.totalEmissions > 200
                              ? "High"
                              : report.totalEmissions > 100
                              ? "Medium"
                              : "Low"}
                          </span>
                          <span>{report.totalEmissions} tonnes</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                              loadReport(report.reportId || report._id)
                            }
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                              openJaaropgaveExport(
                                report.reportId || report._id
                              )
                            }
                            title="VSME Jaaropgave Export"
                          >
                            <i className="fas fa-file-export"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              confirmDeleteReport(report.reportId || report._id)
                            }
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedReportsTable;
