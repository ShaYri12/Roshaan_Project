import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Sidebar from "../../components/Sidebar";
import JaaropgaveExport from "./JaaropgaveExport";

// Import components
import ReportGenerator from "./components/ReportGenerator";
import SavedReportsTable from "./components/SavedReportsTable";
import ReportSection from "./components/ReportSection";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

// Import utilities
import {
  getChartColors,
  getMonthlyEmissionsConfig,
  getCategoryEmissionsConfig,
  exportChartAsImage,
} from "./ChartConfig";
import {
  getUserId,
  fetchSavedReports,
  fetchOrGenerateReport,
  loadReportById,
  deleteReportById,
} from "./utils/dataUtils";
import { generateReportPDF } from "./utils/pdfUtils";

const YearlyReportsPage = () => {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const reportSectionRef = useRef(null);

  // State management
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
  const [showJaaropgaveModal, setShowJaaropgaveModal] = useState(false);
  const [selectedReportForJaaropgave, setSelectedReportForJaaropgave] =
    useState(null);

  // Chart configuration
  const chartColors = getChartColors(theme);
  const [monthlyEmissions, setMonthlyEmissions] = useState(
    getMonthlyEmissionsConfig(theme, chartColors)
  );
  const [categoryEmissions, setCategoryEmissions] = useState(
    getCategoryEmissionsConfig(theme, chartColors)
  );
  const [categoryEmissionsSeries, setCategoryEmissionsSeries] = useState([
    30, 40, 20,
  ]);

  // Apply smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // Initialize user data and fetch saved reports
  useEffect(() => {
    // Document theme
    document.body.className = `${theme}-theme`;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
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
        if (!userObj) {
          try {
            const userDataStr = localStorage.getItem("userData");
            if (userDataStr) {
              userObj = JSON.parse(userDataStr);
            }
          } catch (e) {
            console.error("Error parsing userData:", e);
          }
        }

        // Set the user data
        if (token && userObj && (userObj._id || userObj.id)) {
          console.log("User data found:", userObj._id || userObj.id);
          setUserData({
            _id: userObj._id || userObj.id,
            role: userObj.role || "admin", // Default to admin if no role specified
          });
        } else if (token) {
          console.warn("Token found but no user data, using default user ID");
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

    fetchUserData();
  }, [navigate, theme]);

  // Fetch saved reports when userData changes
  useEffect(() => {
    // Only fetch reports if we have userData
    if (userData) {
      const loadReports = async () => {
        const userId = getUserId(userData);
        const reports = await fetchSavedReports(userId);
        setSavedReports(reports);
      };

      loadReports();
    }
  }, [userData]);

  // Update chart colors when theme changes
  useEffect(() => {
    const chartColors = getChartColors(theme);

    setMonthlyEmissions(getMonthlyEmissionsConfig(theme, chartColors));
    setCategoryEmissions(getCategoryEmissionsConfig(theme, chartColors));
  }, [theme]);

  // User actions
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  // Report actions
  const generateReport = async () => {
    setIsLoading(true);
    try {
      const userId = getUserId(userData);
      const reportData = await fetchOrGenerateReport(selectedYear, userId);

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

      // Scroll to report section
      setTimeout(() => {
        if (reportSectionRef.current) {
          reportSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
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

      alert("Report saved successfully!");

      // Refresh the list of saved reports
      const userId = getUserId(userData);
      const reports = await fetchSavedReports(userId);
      setSavedReports(reports);
    } catch (error) {
      console.error("Error saving report:", error);
      alert(`Failed to save report: ${error.message}`);
    }
  };

  const loadReport = async (reportId) => {
    try {
      const report = await loadReportById(reportId);

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

      // Scroll to report section
      setTimeout(() => {
        if (reportSectionRef.current) {
          reportSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error loading report:", error);
      alert(`Failed to load report: ${error.message}`);
    }
  };

  const exportPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = await generateReportPDF(reportRef, reportData, theme);
      pdf.save(`CO2_Emissions_Report_${reportData.year}.pdf`);
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
      await deleteReportById(reportToDelete);

      // Remove the deleted report from state
      setSavedReports(
        savedReports.filter(
          (report) =>
            report._id !== reportToDelete && report.reportId !== reportToDelete
        )
      );

      // If the currently displayed report is deleted, clear it
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

  const openJaaropgaveExport = (reportId) => {
    setSelectedReportForJaaropgave(reportId);
    setShowJaaropgaveModal(true);
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
        <div className="container px-lg-3 px-0 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0 fw-bold">
              <i className="fas fa-chart-line me-2 text-primary"></i>
              Yearly CO₂ Emissions Reports
            </h1>
          </div>

          <div className="row mb-4">
            <ReportGenerator
              theme={theme}
              years={years}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              generateReport={generateReport}
              isLoading={isLoading}
            />

            <SavedReportsTable
              theme={theme}
              savedReports={savedReports}
              loadReport={loadReport}
              openJaaropgaveExport={openJaaropgaveExport}
              confirmDeleteReport={confirmDeleteReport}
            />
          </div>

          <div ref={reportSectionRef}>
            {reportData && (
              <ReportSection
                theme={theme}
                reportData={reportData}
                savedReports={savedReports}
                saveReport={saveReport}
                exportPDF={exportPDF}
                isGeneratingPdf={isGeneratingPdf}
                monthlyEmissions={monthlyEmissions}
                categoryEmissions={categoryEmissions}
                categoryEmissionsSeries={categoryEmissionsSeries}
                exportChartAsImage={exportChartAsImage}
                reportRef={reportRef}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmModal
        theme={theme}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        deleteReport={deleteReport}
        isDeleting={isDeleting}
      />

      <Modal
        show={showJaaropgaveModal}
        onHide={() => setShowJaaropgaveModal(false)}
        size="xl"
        backdrop="static"
        className={theme === "dark" ? "dark-theme-modal" : ""}
      >
        <Modal.Header closeButton>
          <Modal.Title>VSME Compliant Jaaropgave Export</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedReportForJaaropgave && (
            <JaaropgaveExport
              reportId={selectedReportForJaaropgave}
              theme={theme}
              onClose={() => setShowJaaropgaveModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default YearlyReportsPage;
