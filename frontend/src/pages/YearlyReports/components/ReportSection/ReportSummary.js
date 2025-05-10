import React from "react";

const ReportSummary = ({ theme, reportData }) => {
  return (
    <div className="flex-fill mb-4">
      <div
        className={`card m-0 h-100 border-0 ${
          theme === "dark" ? "bg-dark-secondary text-light" : "bg-light"
        }`}
      >
        <div className="card-body">
          <h5 className="card-title fw-bold text-primary mb-4">
            <i className="fas fa-list-alt me-2"></i>
            Summary
          </h5>
          <div className="table-responsive">
            <table className={`table ${theme === "dark" ? "table-dark" : ""}`}>
              <tbody>
                <tr>
                  <th scope="row" className="border-0">
                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                    Year
                  </th>
                  <td className="border-0 fw-bold">{reportData.year}</td>
                </tr>
                <tr>
                  <th scope="row" className="border-0">
                    <i className="fas fa-weight me-2 text-primary"></i>
                    Total CO₂ Emissions
                  </th>
                  <td className="border-0 fw-bold">
                    {reportData.totalEmissions} tonnes
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border-0">
                    <i className="fas fa-arrow-up me-2 text-danger"></i>
                    Highest Month
                  </th>
                  <td className="border-0 fw-bold">
                    {(() => {
                      const maxValue = Math.max(...reportData.monthlyData);
                      const maxIndex = reportData.monthlyData.indexOf(maxValue);
                      const months = [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ];
                      return (
                        <>
                          <span className="text-danger">
                            {months[maxIndex]}
                          </span>
                          <span className="ms-2 badge bg-danger">
                            {maxValue} tonnes
                          </span>
                        </>
                      );
                    })()}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border-0">
                    <i className="fas fa-calculator me-2 text-primary"></i>
                    Average Monthly Emissions
                  </th>
                  <td className="border-0 fw-bold">
                    {Math.round(
                      reportData.monthlyData.reduce(
                        (acc, val) => acc + val,
                        0
                      ) / 12
                    )}{" "}
                    tonnes
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border-0">
                    <i className="fas fa-exclamation-circle me-2 text-warning"></i>
                    Main Source
                  </th>
                  <td className="border-0 fw-bold">
                    {(() => {
                      const maxValue = Math.max(...reportData.categoryData);
                      const maxIndex =
                        reportData.categoryData.indexOf(maxValue);
                      return (
                        <>
                          <span>{reportData.categories[maxIndex]}</span>
                          <span className="ms-2 badge bg-warning text-dark">
                            {maxValue} tonnes
                          </span>
                        </>
                      );
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSummary;
