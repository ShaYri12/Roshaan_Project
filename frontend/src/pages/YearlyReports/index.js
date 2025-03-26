import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../env";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../../components/Sidebar";

const YearlyReportsPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const reportRef = useRef(null);

  // Chart options for CO2 emissions by category
  const getChartColors = () => {
    return theme === "dark"
      ? {
          titleColor: "#e9ecef",
          labelColor: "#adb5bd",
          gridColor: "#343a40",
          legendColor: "#e9ecef",
          tooltipBackgroundColor: "#272b30",
          tooltipTextColor: "#e9ecef",
          toolbarColor: "#adb5bd",
        }
      : {
          titleColor: "#212529",
          labelColor: "#495057",
          gridColor: "#dee2e6",
          legendColor: "#212529",
          tooltipBackgroundColor: "#ffffff",
          tooltipTextColor: "#212529",
          toolbarColor: "#212529",
        };
  };

  const getChartTheme = () => {
    return {
      mode: theme === "dark" ? "dark" : "light",
      palette: "palette1",
      monochrome: {
        enabled: false,
      },
    };
  };

  // Updated toolbar config with simpler structure
  const getToolbarConfig = () => {
    return {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    };
  };

  // Chart Config
  const chartColors = getChartColors();
  const [monthlyEmissions, setMonthlyEmissions] = useState({
    chart: {
      type: "bar",
      height: 350,
      zoom: { enabled: false },
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
    },
    title: {
      text: "Monthly CO₂ Emissions",
      align: "left",
      style: {
        fontWeight: "bold",
        color: chartColors.titleColor,
      },
    },
    grid: {
      borderColor: chartColors.gridColor,
      row: {
        colors: ["transparent"],
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          colors: chartColors.labelColor,
        },
      },
      axisBorder: {
        color: chartColors.gridColor,
      },
      axisTicks: {
        color: chartColors.gridColor,
      },
    },
    yaxis: {
      title: {
        text: "CO₂ Emissions (tonnes)",
        style: {
          color: chartColors.labelColor,
        },
      },
      labels: {
        style: {
          colors: chartColors.labelColor,
        },
      },
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: function (val) {
          return val + " tonnes";
        },
      },
      style: {
        fontSize: "12px",
      },
    },
    series: [
      {
        name: "CO₂ Emissions",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const [categoryEmissions, setCategoryEmissions] = useState({
    chart: {
      type: "pie",
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
    },
    title: {
      text: "CO₂ Emissions by Category",
      style: {
        color: chartColors.titleColor,
        fontWeight: "bold",
      },
    },
    labels: ["Transportation", "Energy", "Other"],
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (val) => `${val} Tonnes`,
      },
      style: {
        fontSize: "12px",
      },
    },
    legend: {
      position: "bottom",
      labels: {
        colors: chartColors.legendColor,
      },
    },
    dataLabels: {
      style: {
        colors: theme === "dark" ? ["#fff"] : undefined,
      },
    },
    stroke: {
      width: 1,
      colors: theme === "dark" ? ["#343a40"] : undefined,
    },
  });

  const [categoryEmissionsSeries, setCategoryEmissionsSeries] = useState([
    30, 40, 20,
  ]);

  useEffect(() => {
    // Document theme
    document.body.className = `${theme}-theme`;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Try multiple user data storage locations
        let userObj = null;

        // First try userObj
        try {
          const userObjStr = localStorage.getItem("userObj");
          if (userObjStr) {
            userObj = JSON.parse(userObjStr);
          }
        } catch (e) {
          console.error("Error parsing userObj:", e);
        }

        // Then try userData if userObj failed
        if (!userObj || !userObj._id) {
          try {
            const userDataStr = localStorage.getItem("userData");
            if (userDataStr) {
              userObj = JSON.parse(userDataStr);
            }
          } catch (e) {
            console.error("Error parsing userData:", e);
          }
        }

        if (token && userObj && userObj._id) {
          console.log("User data found:", userObj._id);
          setUserData(userObj);
        } else if (token) {
          // We have a token but no user data - use a default for development
          console.warn("Token found but no user data, using default user ID");
          // This is for development only
          const defaultUserId = "6624c7ab8a89c9f76ded3d9e"; // Replace with valid test ID
          setUserData({ _id: defaultUserId, role: "admin" });
        } else {
          console.warn("No authentication found. Redirecting to login");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    // Populate years dropdown (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: 5 }, (_, i) => currentYear - i);
    setYears(yearsList);

    // Fetch saved reports
    const fetchSavedReports = async () => {
      try {
        const token = localStorage.getItem("token");
        // Get user ID from multiple possible sources
        let userId = null;

        try {
          const userObjStr = localStorage.getItem("userObj");
          if (userObjStr) {
            const userObj = JSON.parse(userObjStr);
            userId = userObj._id;
          }
        } catch (e) {
          console.error("Error getting user ID from userObj:", e);
        }

        if (!userId) {
          try {
            const userDataStr = localStorage.getItem("userData");
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              userId = userData._id;
            }
          } catch (e) {
            console.error("Error getting user ID from userData:", e);
          }
        }

        if (!userId) {
          console.warn("No user ID found, using default for development");
          userId = "6624c7ab8a89c9f76ded3d9e"; // Default test ID
        }

        const response = await fetch(
          `${REACT_APP_API_URL}/yearly-reports?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSavedReports(data);
        } else {
          console.warn("Failed to fetch reports:", response.status);
        }
      } catch (error) {
        console.error("Error fetching saved reports:", error);
      }
    };

    fetchUserData();
    fetchSavedReports();
  }, [navigate, theme]);

  // Update chart colors when theme changes
  useEffect(() => {
    const chartColors = getChartColors();
    const toolbarConfig = getToolbarConfig();
    const chartTheme = getChartTheme();

    setMonthlyEmissions((prev) => ({
      ...prev,
      chart: {
        ...prev.chart,
        foreColor: chartColors.labelColor,
        toolbar: toolbarConfig,
        theme: chartTheme,
      },
      title: {
        ...prev.title,
        style: {
          color: chartColors.titleColor,
          fontWeight: "bold",
        },
      },
      grid: {
        borderColor: chartColors.gridColor,
        row: {
          colors: ["transparent"],
        },
      },
      xaxis: {
        ...prev.xaxis,
        labels: {
          ...prev.xaxis.labels,
          style: {
            colors: chartColors.labelColor,
          },
        },
        axisBorder: {
          color: chartColors.gridColor,
        },
        axisTicks: {
          color: chartColors.gridColor,
        },
      },
      yaxis: {
        ...prev.yaxis,
        title: {
          ...prev.yaxis.title,
          style: {
            color: chartColors.labelColor,
          },
        },
        labels: {
          style: {
            colors: chartColors.labelColor,
          },
        },
      },
      tooltip: {
        ...prev.tooltip,
        theme: theme === "dark" ? "dark" : "light",
      },
    }));

    setCategoryEmissions((prev) => ({
      ...prev,
      chart: {
        ...prev.chart,
        foreColor: chartColors.labelColor,
        toolbar: toolbarConfig,
        theme: chartTheme,
      },
      title: {
        ...prev.title,
        style: {
          color: chartColors.titleColor,
          fontWeight: "bold",
        },
      },
      tooltip: {
        ...prev.tooltip,
        theme: theme === "dark" ? "dark" : "light",
      },
      legend: {
        ...prev.legend,
        labels: {
          colors: chartColors.legendColor,
        },
      },
      dataLabels: {
        style: {
          colors: theme === "dark" ? ["#fff"] : undefined,
        },
      },
      stroke: {
        width: 1,
        colors: theme === "dark" ? ["#343a40"] : undefined,
      },
    }));
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.clear();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      // Get user ID from multiple possible sources
      let userId = null;

      // First try userObj
      try {
        const userObjStr = localStorage.getItem("userObj");
        if (userObjStr) {
          const userObj = JSON.parse(userObjStr);
          if (userObj && userObj._id) {
            userId = userObj._id;
          }
        }
      } catch (e) {
        console.error("Error getting user ID from userObj:", e);
      }

      // Then try userData if userObj failed
      if (!userId) {
        try {
          const userDataStr = localStorage.getItem("userData");
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData && userData._id) {
              userId = userData._id;
            }
          }
        } catch (e) {
          console.error("Error getting user ID from userData:", e);
        }
      }

      // Use userData state as fallback
      if (!userId && userData && userData._id) {
        userId = userData._id;
      }

      // Final fallback for development
      if (!userId) {
        // This is for development only - in production, throw an error
        userId = "6624c7ab8a89c9f76ded3d9e"; // Replace with valid test ID
        console.warn("Using default user ID for development:", userId);
      }

      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

      // First check if a report already exists for this year
      const checkResponse = await fetch(
        `${REACT_APP_API_URL}/yearly-reports/year/${selectedYear}?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If report exists, use it
      if (checkResponse.ok) {
        const existingReport = await checkResponse.json();
        setReportData(existingReport);

        // Update charts with real data
        setMonthlyEmissions((prev) => ({
          ...prev,
          series: [
            {
              name: "CO₂ Emissions",
              data: existingReport.monthlyData,
            },
          ],
        }));

        setCategoryEmissionsSeries(existingReport.categoryData);
        setIsLoading(false);
        return;
      }

      // If no existing report, generate a new one
      const response = await fetch(`${REACT_APP_API_URL}/yearly-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: selectedYear,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Error generating report: ${response.statusText}`
        );
      }

      const reportData = await response.json();
      setReportData(reportData);

      // Update charts with real data
      setMonthlyEmissions((prev) => ({
        ...prev,
        series: [
          {
            name: "CO₂ Emissions",
            data: reportData.monthlyData,
          },
        ],
      }));

      setCategoryEmissionsSeries(reportData.categoryData);

      // Add to saved reports if it's not already there
      const reportExists = savedReports.some(
        (r) => r.reportId === reportData.reportId || r._id === reportData._id
      );

      if (!reportExists) {
        setSavedReports((prev) => [...prev, reportData]);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async () => {
    try {
      if (!reportData || !reportData._id) {
        throw new Error("No report data to save");
      }

      const token = localStorage.getItem("token");

      // Since our API automatically saves the report when generating,
      // this function is now just for user feedback
      alert("Report saved successfully!");

      // Refresh the list of saved reports
      const response = await fetch(`${REACT_APP_API_URL}/yearly-reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const reports = await response.json();
        setSavedReports(reports);
      }
    } catch (error) {
      console.error("Error saving report:", error);
      alert(`Failed to save report: ${error.message}`);
    }
  };

  const loadReport = (reportId) => {
    try {
      const token = localStorage.getItem("token");

      fetch(`${REACT_APP_API_URL}/yearly-reports/${reportId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error loading report: ${response.statusText}`);
          }
          return response.json();
        })
        .then((report) => {
          setReportData(report);
          setSelectedYear(report.year);

          // Update charts with saved report data
          setMonthlyEmissions((prev) => ({
            ...prev,
            series: [
              {
                name: "CO₂ Emissions",
                data: report.monthlyData,
              },
            ],
          }));

          setCategoryEmissionsSeries(report.categoryData);
        })
        .catch((error) => {
          console.error("Error loading report:", error);
          alert(`Failed to load report: ${error.message}`);
        });
    } catch (error) {
      console.error("Error loading report:", error);
      alert(`Failed to load report: ${error.message}`);
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPdf(true);
    try {
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add company logo or header
      pdf.setFontSize(22);
      pdf.setTextColor(20, 80, 140); // Dark blue
      pdf.text(`CO₂ Emissions Yearly Report`, 105, 15, {
        align: "center",
      });

      // Add year subtitle
      pdf.setFontSize(18);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Year: ${reportData.year}`, 105, 25, {
        align: "center",
      });

      // Add organization info
      const userObj = JSON.parse(localStorage.getItem("userObj"));
      const orgName =
        userObj?.company?.name || userObj?.organization || "Your Organization";
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Organization: ${orgName}`, 105, 35, {
        align: "center",
      });

      // Add generation date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        105,
        42,
        {
          align: "center",
        }
      );

      // Add the report image
      pdf.addImage(imgData, "PNG", 0, 48, imgWidth, imgHeight);

      // Add summary table
      const finalY = 48 + imgHeight + 10;
      pdf.setFontSize(14);
      pdf.setTextColor(20, 80, 140);
      pdf.text("Summary of Emissions", 105, finalY, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);

      // Summary table
      const summaryData = [
        ["Total Emissions", `${reportData.totalEmissions} tonnes CO₂`],
        [
          "Transportation Emissions",
          `${reportData.categoryData[0]} tonnes CO₂`,
        ],
        ["Energy Emissions", `${reportData.categoryData[1]} tonnes CO₂`],
        ["Other Emissions", `${reportData.categoryData[2]} tonnes CO₂`],
        [
          "Average Monthly Emissions",
          `${Math.round(reportData.totalEmissions / 12)} tonnes CO₂`,
        ],
      ];

      // Draw summary table
      pdf.autoTable({
        startY: finalY + 5,
        head: [["Category", "Amount"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [20, 80, 140], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        margin: { left: 50, right: 50 },
      });

      // Add recommendations section
      const tableEndY = pdf.previousAutoTable.finalY + 10;
      pdf.setFontSize(14);
      pdf.setTextColor(20, 80, 140);
      pdf.text("Recommendations", 105, tableEndY, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);

      // Simple recommendations based on data
      const highestEmissionMonth = reportData.monthlyData.indexOf(
        Math.max(...reportData.monthlyData)
      );
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

      pdf.text(
        [
          `1. Focus on reducing emissions in ${months[highestEmissionMonth]}, your highest emission month.`,
          `2. Consider strategies to lower ${
            reportData.categoryData.indexOf(
              Math.max(...reportData.categoryData)
            ) === 0
              ? "transportation"
              : "energy"
          } emissions, your largest source.`,
          `3. Set a target to reduce overall emissions by 10% next year.`,
          `4. Implement regular monitoring and tracking of emissions to identify reduction opportunities.`,
        ],
        20,
        tableEndY + 10
      );

      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Page ${i} of ${pageCount} - Generated by CO₂ Emissions Tracker - Report ID: ${reportData.reportId}`,
          105,
          290,
          { align: "center" }
        );
      }

      // Save the PDF
      pdf.save(`CO2_Yearly_Report_${reportData.year}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const deleteReport = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);
    try {
      console.log("Attempting to delete report with ID:", reportToDelete);
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

      const response = await fetch(
        `${REACT_APP_API_URL}/yearly-reports/${reportToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response status:", response.status);

      let errorMessage = "";
      try {
        // Try to parse response as JSON
        const responseData = await response.json();
        console.log("Delete response data:", responseData);

        if (!response.ok) {
          errorMessage =
            responseData.message ||
            responseData.error ||
            `Server returned ${response.status}`;
          throw new Error(errorMessage);
        }
      } catch (parseError) {
        // If we can't parse JSON, use the status text
        if (!response.ok) {
          errorMessage = `Error deleting report: ${response.statusText} (${response.status})`;
          throw new Error(errorMessage);
        }
      }

      // Remove the deleted report from the savedReports state
      setSavedReports(
        savedReports.filter(
          (report) =>
            report._id !== reportToDelete && report.reportId !== reportToDelete
        )
      );

      // If the currently displayed report is the one being deleted, clear it
      if (
        reportData &&
        (reportData._id === reportToDelete ||
          reportData.reportId === reportToDelete)
      ) {
        setReportData(null);
      }

      alert("Report deleted successfully!");
    } catch (error) {
      console.error("Error details:", error);
      alert(`Failed to delete report: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setReportToDelete(null);
    }
  };

  const confirmDeleteReport = (reportId) => {
    setReportToDelete(reportId);
    setShowDeleteConfirm(true);
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container">
          <h1 className="my-4">Yearly CO₂ Emissions Reports</h1>

          <div className="row mb-4 row-gap-5">
            <div className="col-md-4">
              <div className={`bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title">Generate New Report</h5>
                  <div className="mb-3">
                    <label htmlFor="yearSelect" className="form-label">
                      Select Year
                    </label>
                    <select
                      id="yearSelect"
                      className="form-select"
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary w-100"
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
                      "Generate Report"
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className={`bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title mb-2">Saved Reports</h5>
                  {savedReports.length === 0 ? (
                    <p className="text-muted">
                      No saved reports yet. Generate and save your first report!
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Report ID</th>
                            <th>Year</th>
                            <th>Date Created</th>
                            <th>Total Emissions</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedReports.map((report) => (
                            <tr key={report.reportId || report._id}>
                              <td>{report.reportId || report._id}</td>
                              <td>{report.year}</td>
                              <td>
                                {new Date(
                                  report.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td>{report.totalEmissions} tonnes</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() =>
                                    loadReport(report.reportId || report._id)
                                  }
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    confirmDeleteReport(
                                      report.reportId || report._id
                                    )
                                  }
                                >
                                  Delete
                                </button>
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
          </div>

          {reportData && (
            <div className="row">
              <div className="col-12">
                <div className={`card bg-${theme} border-0 shadow-sm mb-4`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">
                        CO₂ Emissions Report for {reportData.year}
                      </h4>
                      <div>
                        {!savedReports.some(
                          (r) =>
                            (r.reportId === reportData.reportId ||
                              r._id === reportData._id) &&
                            r.year === reportData.year
                        ) && (
                          <button
                            className="btn btn-success me-2"
                            onClick={saveReport}
                          >
                            Save Report
                          </button>
                        )}
                        <button
                          className="btn btn-info"
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

                    <div ref={reportRef}>
                      <div className="row">
                        <div className="col-md-4 mb-4">
                          <div
                            className={`card bg-${theme} border-0 shadow-sm h-100`}
                          >
                            <div className="card-body text-center">
                              <h5 className="card-title">Total Emissions</h5>
                              <div className="display-4 font-weight-bold mt-3 mb-3">
                                {reportData.totalEmissions}
                              </div>
                              <p className="text-muted">Tonnes of CO₂</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-8 mb-4">
                          <div
                            className={`card bg-${theme} border-0 shadow-sm h-100`}
                          >
                            <div className="card-body">
                              <h5 className="card-title">
                                Monthly Distribution
                              </h5>
                              <Chart
                                options={monthlyEmissions}
                                series={monthlyEmissions.series}
                                type="bar"
                                height={300}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-4">
                          <div
                            className={`card bg-${theme} border-0 shadow-sm h-100`}
                          >
                            <div className="card-body">
                              <h5 className="card-title">
                                Emissions by Category
                              </h5>
                              <Chart
                                options={categoryEmissions}
                                series={categoryEmissionsSeries}
                                type="pie"
                                height={300}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6 mb-4">
                          <div
                            className={`card bg-${theme} border-0 shadow-sm h-100`}
                          >
                            <div className="card-body">
                              <h5 className="card-title">Summary</h5>
                              <div className="table-responsive">
                                <table className="table">
                                  <tbody>
                                    <tr>
                                      <th scope="row">Year</th>
                                      <td>{reportData.year}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Total CO₂ Emissions</th>
                                      <td>
                                        {reportData.totalEmissions} tonnes
                                      </td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Highest Month</th>
                                      <td>
                                        {(() => {
                                          const maxValue = Math.max(
                                            ...reportData.monthlyData
                                          );
                                          const maxIndex =
                                            reportData.monthlyData.indexOf(
                                              maxValue
                                            );
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
                                          return `${months[maxIndex]} (${maxValue} tonnes)`;
                                        })()}
                                      </td>
                                    </tr>
                                    <tr>
                                      <th scope="row">
                                        Average Monthly Emissions
                                      </th>
                                      <td>
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
                                      <th scope="row">Main Source</th>
                                      <td>
                                        {(() => {
                                          const maxValue = Math.max(
                                            ...reportData.categoryData
                                          );
                                          const maxIndex =
                                            reportData.categoryData.indexOf(
                                              maxValue
                                            );
                                          return `${reportData.categories[maxIndex]} (${maxValue} tonnes)`;
                                        })()}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteConfirm ? "show" : ""}`}
        style={{ display: showDeleteConfirm ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showDeleteConfirm}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className={`modal-content bg-${theme}`}>
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowDeleteConfirm(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this report? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={deleteReport}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Report"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showDeleteConfirm && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowDeleteConfirm(false)}
        ></div>
      )}
    </div>
  );
};

export default YearlyReportsPage;
