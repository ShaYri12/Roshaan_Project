import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Alert,
  Spinner,
  Table,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import { authenticatedFetch } from "../../utils/axiosConfig";
import { REACT_APP_API_URL } from "../../env";
import jsPDF from "jspdf";
import "jspdf-autotable";

const JaaropgaveExport = ({ reportId, theme, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const reportRef = useRef(null);
  const [exportInProgress, setExportInProgress] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/yearly-reports/jaaropgave/${reportId}/json`,
          { method: "GET" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch report data");
        }

        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching Jaaropgave data:", error);

        // Special handling for authentication errors
        if (
          error.isAuthError ||
          (error.message && error.message.includes("jwt expired")) ||
          (error.message && error.message.includes("Token verification failed"))
        ) {
          setError(
            "Your session has expired. Please log in again to continue."
          );
          // Let parent component handle the redirect
        } else {
          setError("Failed to load report. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format a number with 2 decimal places and thousand separators
  const formatNumber = (number) => {
    if (number === undefined || number === null) return "N/A";
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge bg="primary">Active</Badge>;
      case "achieved":
        return <Badge bg="success">Achieved</Badge>;
      case "missed":
        return <Badge bg="danger">Missed</Badge>;
      case "cancelled":
        return <Badge bg="secondary">Cancelled</Badge>;
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "planned":
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "in_progress":
      case "in-progress":
        return <Badge bg="info">In Progress</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Export as PDF
  const exportAsPDF = async () => {
    if (!reportData || !reportRef.current || exportInProgress) return;

    setExportInProgress(true);
    try {
      // Create a new document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;

      // Add report title
      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 40);
      const title = `VSME Emissions Annual Report (Jaaropgave) - ${reportData.reportDetails.year}`;
      pdf.text(title, pageWidth / 2, 20, { align: "center" });

      // Add date and report ID (removed organization)
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
      pdf.text(`Report ID: ${reportData.reportDetails.reportId}`, 14, 35);

      // Add verification status - adjusted Y positions
      pdf.setFontSize(10);
      pdf.text(
        `Verification Status: ${
          reportData.reportDetails.verificationStatus.verified
            ? "Verified"
            : "Unverified"
        }`,
        14,
        40
      );
      if (reportData.reportDetails.verificationStatus.verificationDate) {
        pdf.text(
          `Verified on: ${new Date(
            reportData.reportDetails.verificationStatus.verificationDate
          ).toLocaleDateString()}`,
          14,
          45
        );
      }

      // Add compliance status - adjusted Y position
      pdf.setFontSize(14);
      pdf.setTextColor(60, 60, 60);
      pdf.text("Compliance Status", 14, 55);

      // Compliance status table
      const complianceData = reportData.complianceStatus.map((standard) => [
        standard.standard,
        standard.compliant ? "Compliant" : "Non-compliant",
        standard.notes,
      ]);

      pdf.autoTable({
        startY: 60,
        head: [["Standard", "Status", "Notes"]],
        body: complianceData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Add emissions summary
      const finalY = pdf.previousAutoTable.finalY + 10;
      pdf.setFontSize(14);
      pdf.text("Emissions Summary", 14, finalY);

      const emissionsSummary = [
        [
          "Total Emissions",
          `${formatNumber(reportData.emissionsData.totalEmissions)} kg CO2e`,
        ],
        [
          "Average Monthly Emissions",
          `${formatNumber(
            reportData.emissionsData.calculations.averageMonthlyEmission
          )} kg CO2e`,
        ],
        [
          "Year-over-Year Change",
          `${formatNumber(
            reportData.emissionsData.calculations.yearOverYearChange
          )}%`,
        ],
        [
          "Total Reduction Achieved",
          `${formatNumber(
            reportData.emissionsData.calculations.totalReductionAchieved
          )} kg CO2e`,
        ],
        [
          "Reduction from Baseline",
          `${formatNumber(
            reportData.emissionsData.calculations
              .percentageReductionFromBaseline
          )}%`,
        ],
      ];

      pdf.autoTable({
        startY: finalY + 5,
        head: [["Metric", "Value"]],
        body: emissionsSummary,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Add emissions by category
      const categoryY = pdf.previousAutoTable.finalY + 10;
      pdf.text("Emissions by Category", 14, categoryY);

      const categoriesData = reportData.emissionsData.byCategory.map((cat) => [
        cat.category,
        `${formatNumber(cat.emissions)} kg CO2e`,
        `${formatNumber(
          (cat.emissions / reportData.emissionsData.totalEmissions) * 100
        )}%`,
      ]);

      pdf.autoTable({
        startY: categoryY + 5,
        head: [["Category", "Emissions", "% of Total"]],
        body: categoriesData,
        theme: "grid",
        headStyles: { fillColor: [142, 68, 173] },
      });

      // Add target achievements
      if (
        reportData.targetAchievements &&
        reportData.targetAchievements.length > 0
      ) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text("Target Achievements", 14, 20);

        // Create target achievements table
        const targetData = reportData.targetAchievements.map((target) => [
          target.name,
          `${target.baselineYear} - ${target.targetYear}`,
          `${formatNumber(target.reductionGoal)} kg CO2e`,
          `${formatNumber(target.actualReduction)} kg CO2e`,
          `${formatNumber(target.progressPercentage)}%`,
          target.status,
        ]);

        pdf.autoTable({
          startY: 30,
          head: [["Target", "Period", "Goal", "Actual", "Progress", "Status"]],
          body: targetData,
          theme: "grid",
          headStyles: { fillColor: [39, 174, 96] },
        });
      }

      // Add scenario outcomes
      if (
        reportData.scenarioOutcomes &&
        reportData.scenarioOutcomes.length > 0
      ) {
        // Always start scenarios on a new page for better organization
        pdf.addPage();

        // Reset position for the new page
        let scenarioY = 20;
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text("Scenario Outcomes", 14, scenarioY);

        reportData.scenarioOutcomes.forEach((scenario, index) => {
          // Check if we need a new page for this scenario
          if (index > 0) {
            // For scenarios after the first one, check if we need a new page
            const estimatedContentHeight = 80; // Base height for scenario header + potential table

            if (
              pdf.previousAutoTable &&
              pdf.previousAutoTable.finalY + estimatedContentHeight >
                pdf.internal.pageSize.height - 20
            ) {
              pdf.addPage();
              scenarioY = 20;
            } else {
              // If we're on the same page, position below the previous table with adequate spacing
              scenarioY = pdf.previousAutoTable
                ? pdf.previousAutoTable.finalY + 25
                : 50;
            }
          } else {
            // First scenario starts at a position below the header
            scenarioY += 15;
          }

          // Scenario header with better spacing
          pdf.setFontSize(12);
          pdf.setTextColor(40, 40, 40);
          pdf.text(`Scenario: ${scenario.name}`, 14, scenarioY);

          // Add period information with better vertical spacing
          pdf.setFontSize(10);
          scenarioY += 8; // Increase spacing between lines
          pdf.text(
            `Period: ${scenario.startYear} - ${scenario.endYear}`,
            14,
            scenarioY
          );

          // Add progress information with better vertical spacing
          scenarioY += 8; // Increase spacing between lines
          pdf.text(
            `Progress: ${formatNumber(scenario.progressPercentage)}%`,
            14,
            scenarioY
          );

          // Measures table for this scenario
          if (scenario.measures && scenario.measures.length > 0) {
            const measuresData = scenario.measures.map((measure) => [
              measure.name,
              `${formatNumber(measure.estimatedReduction)} kg CO2e`,
              `${formatNumber(measure.actualReduction)} kg CO2e`,
              measure.status,
            ]);

            // Position the table with adequate spacing from the text above
            pdf.autoTable({
              startY: scenarioY + 10, // Increase spacing before table
              head: [["Measure", "Estimated", "Actual", "Status"]],
              body: measuresData,
              theme: "grid",
              headStyles: { fillColor: [52, 152, 219] },
              margin: { top: 10, bottom: 10 }, // Add margins for better spacing
              didDrawPage: (data) => {
                // When a new page is created for the table, add the scenario header again
                if (data.pageCount > 1 && data.pageNumber > 1) {
                  pdf.setFontSize(10);
                  pdf.setTextColor(80, 80, 80);
                  pdf.text(`Continued: ${scenario.name}`, 14, 10);
                }
              },
            });
          }
        });
      }

      // Add reference information
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Reporting Reference Information", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFontSize(10);
      pdf.text(
        `Reporting Standard: ${reportData.referenceData.reportingStandard}`,
        20,
        30
      );
      pdf.text(`Version: ${reportData.referenceData.version}`, 20, 35);
      pdf.text(
        `Reporting Period: ${formatDate(
          reportData.referenceData.reportingPeriod.start
        )} - ${formatDate(reportData.referenceData.reportingPeriod.end)}`,
        20,
        40
      );

      // Add legal disclaimer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const disclaimer =
        "This report complies with VSME Emissions Reporting Standards. The data presented herein has been verified and represents an accurate account of emissions and reduction efforts for the reporting period.";
      const textLines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
      pdf.text(textLines, 20, pdf.internal.pageSize.height - 30);

      // Save the PDF
      pdf.save(
        `VSME_Jaaropgave_${
          reportData.reportDetails.year
        }_${new Date().getTime()}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setExportInProgress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!reportData) {
    return <Alert variant="warning">No report data available.</Alert>;
  }

  return (
    <div
      ref={reportRef}
      className={`jaaropgave-export py-3 ${
        theme === "dark" ? "bg-dark text-light" : ""
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 px-4">
        <h2 className="mb-0">VSME Emissions Annual Report (Jaaropgave)</h2>
        <div>
          <Button
            variant="success"
            onClick={exportAsPDF}
            disabled={exportInProgress}
            className="d-flex align-items-center"
          >
            {exportInProgress ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Exporting...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf me-2"></i>
                Export as PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Card
        className={`mb-4 ${
          theme === "dark" ? "bg-dark text-light border-secondary" : ""
        }`}
      >
        <Card.Body>
          <div className="d-flex justify-content-between flex-wrap">
            <div className="report-details-container">
              <h5 className="mb-1">Report Details</h5>
              <p className="mb-1">
                <strong>Year:</strong> {reportData.reportDetails.year}
              </p>
              <p className="mb-1">
                <strong>Organization:</strong>{" "}
                {reportData.reportDetails.organization}
              </p>
              <p className="mb-1">
                <strong>Report ID:</strong> {reportData.reportDetails.reportId}
              </p>
              <p className="mb-0">
                <strong>Generated:</strong>{" "}
                {formatDate(reportData.reportDetails.generatedDate)}
              </p>
            </div>
            <div className="verification-status-container">
              <h5 className="mb-1">Verification Status</h5>
              <p className="mb-1">
                <strong>Status:</strong>{" "}
                <Badge
                  bg={
                    reportData.reportDetails.verificationStatus.verified
                      ? "success"
                      : "warning"
                  }
                >
                  {reportData.reportDetails.verificationStatus.verified
                    ? "Verified"
                    : "Unverified"}
                </Badge>
              </p>
              {reportData.reportDetails.verificationStatus.verifiedBy && (
                <p className="mb-1">
                  <strong>Verified By:</strong>{" "}
                  {reportData.reportDetails.verificationStatus.verifiedBy}
                </p>
              )}
              {reportData.reportDetails.verificationStatus.verificationDate && (
                <p className="mb-1">
                  <strong>Verified On:</strong>{" "}
                  {formatDate(
                    reportData.reportDetails.verificationStatus.verificationDate
                  )}
                </p>
              )}
              <p className="mb-0">
                <strong>Method:</strong>{" "}
                {reportData.reportDetails.verificationStatus
                  .verificationMethod || "N/A"}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        variant={theme === "dark" ? "dark" : "tabs"}
      >
        <Tab eventKey="summary" title="Summary" className="bg-transparent">
          <Card
            className={`mb-4 ${
              theme === "dark" ? "bg-dark text-light border-secondary" : ""
            }`}
          >
            <Card.Body>
              <h5 className="mb-3">Emissions Summary</h5>
              <div className="row">
                <div className="col-md-6">
                  <Table
                    striped
                    bordered
                    responsive
                    className={theme === "dark" ? "table-dark" : ""}
                  >
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Emissions</td>
                        <td>
                          {formatNumber(
                            reportData.emissionsData.totalEmissions
                          )}{" "}
                          kg CO2e
                        </td>
                      </tr>
                      <tr>
                        <td>Average Monthly Emissions</td>
                        <td>
                          {formatNumber(
                            reportData.emissionsData.calculations
                              .averageMonthlyEmission
                          )}{" "}
                          kg CO2e
                        </td>
                      </tr>
                      <tr>
                        <td>Year-over-Year Change</td>
                        <td>
                          {reportData.emissionsData.calculations
                            .yearOverYearChange > 0
                            ? "+"
                            : ""}
                          {formatNumber(
                            reportData.emissionsData.calculations
                              .yearOverYearChange
                          )}
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>Total Reduction Achieved</td>
                        <td>
                          {formatNumber(
                            reportData.emissionsData.calculations
                              .totalReductionAchieved
                          )}{" "}
                          kg CO2e
                        </td>
                      </tr>
                      <tr>
                        <td>Reduction from Baseline</td>
                        <td>
                          {formatNumber(
                            reportData.emissionsData.calculations
                              .percentageReductionFromBaseline
                          )}
                          %
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-2">Emissions by Category</h6>
                  <Table
                    striped
                    bordered
                    responsive
                    className={theme === "dark" ? "table-dark" : ""}
                  >
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Emissions (kg CO2e)</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.emissionsData.byCategory.map(
                        (category, index) => (
                          <tr key={index}>
                            <td>{category.category}</td>
                            <td>{formatNumber(category.emissions)}</td>
                            <td>
                              {formatNumber(
                                (category.emissions /
                                  reportData.emissionsData.totalEmissions) *
                                  100
                              )}
                              %
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card
            className={`mb-4 ${
              theme === "dark" ? "bg-dark text-light border-secondary" : ""
            }`}
          >
            <Card.Body>
              <h5 className="mb-3">Compliance Status</h5>
              <Table
                striped
                bordered
                responsive
                className={theme === "dark" ? "table-dark" : ""}
              >
                <thead>
                  <tr>
                    <th>Standard</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.complianceStatus.map((standard, index) => (
                    <tr key={index}>
                      <td>{standard.standard}</td>
                      <td>
                        <Badge bg={standard.compliant ? "success" : "danger"}>
                          {standard.compliant ? "Compliant" : "Non-compliant"}
                        </Badge>
                      </td>
                      <td>{standard.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab
          eventKey="targets"
          title="Target Achievements"
          className="bg-transparent"
        >
          <Card
            className={`mb-4 ${
              theme === "dark" ? "bg-dark text-light border-secondary" : ""
            }`}
          >
            <Card.Body>
              <h5 className="mb-3">Target Achievements</h5>
              {reportData.targetAchievements &&
              reportData.targetAchievements.length > 0 ? (
                <Table
                  striped
                  bordered
                  responsive
                  className={theme === "dark" ? "table-dark" : ""}
                >
                  <thead>
                    <tr>
                      <th>Target</th>
                      <th>Period</th>
                      <th>Reduction Goal</th>
                      <th>Actual Reduction</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.targetAchievements.map((target, index) => (
                      <tr key={index}>
                        <td>{target.name}</td>
                        <td>
                          {target.baselineYear} - {target.targetYear}
                        </td>
                        <td>{formatNumber(target.reductionGoal)} kg CO2e</td>
                        <td>{formatNumber(target.actualReduction)} kg CO2e</td>
                        <td>{formatNumber(target.progressPercentage)}%</td>
                        <td>{getStatusBadge(target.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No target achievements data available for this reporting
                  period.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {reportData.targetAchievements &&
            reportData.targetAchievements.map(
              (target, tIndex) =>
                target.milestones &&
                target.milestones.length > 0 && (
                  <Card
                    key={tIndex}
                    className={`mb-4 ${
                      theme === "dark"
                        ? "bg-dark text-light border-secondary"
                        : ""
                    }`}
                  >
                    <Card.Body>
                      <h5 className="mb-3">{target.name} - Milestones</h5>
                      <Table
                        striped
                        bordered
                        responsive
                        className={theme === "dark" ? "table-dark" : ""}
                      >
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Target Reduction</th>
                            <th>Actual Reduction</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {target.milestones.map((milestone, mIndex) => (
                            <tr key={mIndex}>
                              <td>{milestone.year}</td>
                              <td>
                                {formatNumber(milestone.targetReduction)} kg
                                CO2e
                              </td>
                              <td>
                                {formatNumber(milestone.actualReduction)} kg
                                CO2e
                              </td>
                              <td>{getStatusBadge(milestone.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )
            )}
        </Tab>

        <Tab
          eventKey="scenarios"
          title="Scenario Outcomes"
          className="bg-transparent"
        >
          <Card
            className={`mb-4 ${
              theme === "dark" ? "bg-dark text-light border-secondary" : ""
            }`}
          >
            <Card.Body>
              <h5 className="mb-3">Scenario Outcomes</h5>
              {reportData.scenarioOutcomes &&
              reportData.scenarioOutcomes.length > 0 ? (
                <Table
                  striped
                  bordered
                  responsive
                  className={theme === "dark" ? "table-dark" : ""}
                >
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Period</th>
                      <th>Target Reduction</th>
                      <th>Actual Reduction</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.scenarioOutcomes.map((scenario, index) => (
                      <tr key={index}>
                        <td>{scenario.name}</td>
                        <td>
                          {scenario.startYear} - {scenario.endYear}
                        </td>
                        <td>
                          {formatNumber(scenario.targetReduction)} kg CO2e
                        </td>
                        <td>
                          {formatNumber(scenario.actualReduction)} kg CO2e
                        </td>
                        <td>{formatNumber(scenario.progressPercentage)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No scenario outcomes data available for this reporting period.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {reportData.scenarioOutcomes &&
            reportData.scenarioOutcomes.map(
              (scenario, sIndex) =>
                scenario.measures &&
                scenario.measures.length > 0 && (
                  <Card
                    key={sIndex}
                    className={`mb-4 ${
                      theme === "dark"
                        ? "bg-dark text-light border-secondary"
                        : ""
                    }`}
                  >
                    <Card.Body>
                      <h5 className="mb-3">{scenario.name} - Measures</h5>
                      <Table
                        striped
                        bordered
                        responsive
                        className={theme === "dark" ? "table-dark" : ""}
                      >
                        <thead>
                          <tr>
                            <th>Measure</th>
                            <th>Estimated Reduction</th>
                            <th>Actual Reduction</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scenario.measures.map((measure, mIndex) => (
                            <tr key={mIndex}>
                              <td>{measure.name}</td>
                              <td>
                                {formatNumber(measure.estimatedReduction)} kg
                                CO2e
                              </td>
                              <td>
                                {formatNumber(measure.actualReduction)} kg CO2e
                              </td>
                              <td>{getStatusBadge(measure.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )
            )}
        </Tab>

        <Tab
          eventKey="reference"
          title="Reference Data"
          className="bg-transparent"
        >
          <Card
            className={`mb-4 ${
              theme === "dark" ? "bg-dark text-light border-secondary" : ""
            }`}
          >
            <Card.Body>
              <h5 className="mb-3">Reporting Reference Information</h5>
              <Table
                striped
                bordered
                responsive
                className={theme === "dark" ? "table-dark" : ""}
              >
                <tbody>
                  <tr>
                    <th>Reporting Standard</th>
                    <td>{reportData.referenceData.reportingStandard}</td>
                  </tr>
                  <tr>
                    <th>Version</th>
                    <td>{reportData.referenceData.version}</td>
                  </tr>
                  <tr>
                    <th>Reporting Period</th>
                    <td>
                      {formatDate(
                        reportData.referenceData.reportingPeriod.start
                      )}{" "}
                      -{" "}
                      {formatDate(reportData.referenceData.reportingPeriod.end)}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mb-3 mt-4">Data Sources</h5>
              {reportData.dataSources && reportData.dataSources.length > 0 ? (
                <Table
                  striped
                  bordered
                  responsive
                  className={theme === "dark" ? "table-dark" : ""}
                >
                  <thead>
                    <tr>
                      <th>Source Type</th>
                      <th>Data Points</th>
                      <th>Date Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.dataSources.map((source, index) => (
                      <tr key={index}>
                        <td>{source.sourceType}</td>
                        <td>{source.dataPoints}</td>
                        <td>
                          {formatDate(source.dateRange.start)} -{" "}
                          {formatDate(source.dateRange.end)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No data source information available.
                </Alert>
              )}

              <Alert variant="secondary" className="mt-4">
                <h6>Legal Disclaimer</h6>
                <p className="mb-0 small">
                  This report complies with VSME Emissions Reporting Standards.
                  The data presented herein has been verified and represents an
                  accurate account of emissions and reduction efforts for the
                  reporting period.
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <div className="d-flex justify-content-between mt-4 px-4">
        <Button variant="danger" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="success"
          onClick={exportAsPDF}
          disabled={exportInProgress}
          className="d-flex align-items-center"
        >
          {exportInProgress ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Exporting...
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf me-2"></i>
              Export as PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default JaaropgaveExport;
