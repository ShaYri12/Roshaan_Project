import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../env";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../../components/Sidebar";
import JaaropgaveExport from "./JaaropgaveExport";
import { Modal } from "react-bootstrap";

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
  const [showJaaropgaveModal, setShowJaaropgaveModal] = useState(false);
  const [selectedReportForJaaropgave, setSelectedReportForJaaropgave] =
    useState(null);

  const reportRef = useRef(null);
  const reportSectionRef = useRef(null);

  // Apply smooth scrolling behavior to the document
  useEffect(() => {
    // Add CSS scroll behavior for smooth scrolling throughout the app
    document.documentElement.style.scrollBehavior = "smooth";

    // Clean up when component unmounts
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // Chart options for CO2 emissions by category
  const getChartColors = useCallback(() => {
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
  }, [theme]);

  const getChartTheme = useCallback(() => {
    return {
      mode: theme === "dark" ? "dark" : "light",
      palette: "palette1",
      monochrome: {
        enabled: false,
      },
    };
  }, [theme]);

  // Updated toolbar config with simpler structure
  const getToolbarConfig = useCallback(() => {
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
  }, []);

  // Chart Config
  const chartColors = getChartColors();
  const [monthlyEmissions, setMonthlyEmissions] = useState({
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
      sparkline: {
        enabled: false,
      },
      fontFamily: "'Inter', 'Helvetica', sans-serif",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: theme === "light" ? "light" : "dark",
        type: "vertical",
        shadeIntensity: 0.2,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#4CAF50"],
    grid: {
      borderColor: chartColors.gridColor,
      strokeDashArray: 5,
      row: {
        colors: ["transparent"],
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
    markers: {
      size: 5,
      strokeWidth: 0,
      hover: {
        size: 7,
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
          fontSize: "12px",
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
          fontSize: "13px",
          fontWeight: 400,
        },
      },
      labels: {
        style: {
          colors: chartColors.labelColor,
          fontSize: "12px",
        },
        formatter: (val) => {
          return Math.round(val);
        },
      },
    },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: function (val) {
          return (typeof val === "number" ? val.toFixed(1) : val) + " tonnes";
        },
      },
      style: {
        fontSize: "12px",
      },
      x: {
        show: true,
      },
      marker: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
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
      type: "donut",
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
      fontFamily: "'Inter', 'Helvetica', sans-serif",
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    colors: ["#2196F3", "#FF9800", "#9C27B0"],
    labels: ["Transportation", "Energy", "Other"],
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (val) =>
          `${typeof val === "number" ? val.toFixed(1) : val} Tonnes`,
      },
      style: {
        fontSize: "12px",
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 10,
        height: 10,
        radius: 50,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      labels: {
        colors: chartColors.legendColor,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "55%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 500,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 600,
              formatter: function (val) {
                return (typeof val === "number" ? val.toFixed(1) : val) + " t";
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return (
                  (typeof total === "number" ? total.toFixed(1) : total) + " t"
                );
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: theme === "dark" ? ["#343a40"] : ["#ffffff"],
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

        // Check for both id and _id formats
        if (token && userObj && (userObj._id || userObj.id)) {
          console.log("User data found:", userObj._id || userObj.id);
          // Use the available id format and store in userData state
          setUserData({
            _id: userObj._id || userObj.id,
            role: userObj.role || "admin", // Default to admin if no role specified
          });
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
            // Check for both id and _id formats
            userId = userObj._id || userObj.id;
          }
        } catch (e) {
          console.error("Error getting user ID from userObj:", e);
        }

        if (!userId) {
          try {
            const userDataStr = localStorage.getItem("userData");
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              // Check for both id and _id formats
              userId = userData._id || userData.id;
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
  }, [theme, getChartColors, getChartTheme, getToolbarConfig]);

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
          if (userObj) {
            // Check for both id and _id formats
            userId = userObj._id || userObj.id;
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
            if (userData) {
              // Check for both id and _id formats
              userId = userData._id || userData.id;
            }
          }
        } catch (e) {
          console.error("Error getting user ID from userData:", e);
        }
      }

      // Use userData state as fallback
      if (!userId && userData) {
        // Check for both id and _id formats in userData state
        userId = userData._id || userData.id;
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

        // Scroll to report section after a short delay to ensure rendering is complete
        setTimeout(() => {
          if (reportSectionRef.current) {
            reportSectionRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);

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

      // Scroll to report section after a short delay to ensure rendering is complete
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
      console.log(`Attempting to load report with ID: ${reportId}`);

      fetch(`${REACT_APP_API_URL}/yearly-reports/${reportId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            // Try to get the error message from the response body
            let errorMessage = `Error loading report: ${response.statusText}`;
            try {
              const errorData = await response.json();
              if (errorData && errorData.message) {
                errorMessage = `Error loading report: ${errorData.message}`;
              }
            } catch (e) {
              console.error("Error parsing error response:", e);
            }
            throw new Error(errorMessage);
          }
          return response.json();
        })
        .then((report) => {
          console.log("Report loaded successfully:", report);
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

          // Scroll to report section after a short delay to ensure rendering is complete
          setTimeout(() => {
            if (reportSectionRef.current) {
              reportSectionRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 100);
        })
        .catch((error) => {
          console.error("Error loading report:", error);
          alert(`Failed to load report: ${error.message}`);
        });
    } catch (error) {
      console.error("Error in loadReport function:", error);
      alert(`Failed to load report: ${error.message}`);
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPdf(true);
    try {
      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Step 1: Add PDF Header
      pdf.setFontSize(22);
      pdf.setTextColor(40, 40, 40);
      pdf.text(`Emissions Report ${reportData.year}`, pageWidth / 2, 20, {
        align: "center",
      });

      // Add subtitle with CO2 text
      pdf.setFontSize(16);
      pdf.text(`Annual CO2 Emissions Report`, pageWidth / 2, 30, {
        align: "center",
      });

      // Add generation date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        38,
        {
          align: "center",
        }
      );

      let currentY = 45;

      // Step 2: Capture and add Total Emissions section
      const totalEmissionsSection = reportRef.current.querySelector(
        ".card-body.text-center.py-4"
      );
      if (totalEmissionsSection) {
        const totalEmissionsCanvas = await html2canvas(totalEmissionsSection, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === "dark" ? "#1a1d20" : "#ffffff",
        });

        const imgWidth = pageWidth - margin * 2;
        const imgHeight =
          (totalEmissionsCanvas.height * imgWidth) / totalEmissionsCanvas.width;

        pdf.addImage(
          totalEmissionsCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          currentY,
          imgWidth,
          imgHeight,
          "",
          "FAST"
        );

        currentY += imgHeight + 15;
      }

      // Step 3: Capture and add Monthly Distribution section
      const monthlySection = reportRef.current.querySelector(
        ".card-body:has(.fas.fa-chart-line)"
      );
      if (monthlySection) {
        if (currentY + 100 > pageHeight) {
          pdf.addPage();
          currentY = margin;
        }

        const monthlyCanvas = await html2canvas(monthlySection, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === "dark" ? "#1a1d20" : "#ffffff",
        });

        const imgWidth = pageWidth - margin * 2;
        const imgHeight =
          (monthlyCanvas.height * imgWidth) / monthlyCanvas.width;

        pdf.addImage(
          monthlyCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          currentY,
          imgWidth,
          imgHeight,
          "",
          "FAST"
        );

        currentY += imgHeight + 15;
      }

      // Step 4: Capture and add Emissions by Category section
      const categorySection = reportRef.current.querySelector(
        ".card-body:has(.fas.fa-chart-pie)"
      );
      if (categorySection) {
        if (currentY + 100 > pageHeight) {
          pdf.addPage();
          currentY = margin;
        }

        const categoryCanvas = await html2canvas(categorySection, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === "dark" ? "#1a1d20" : "#ffffff",
        });

        const imgWidth = pageWidth - margin * 2;
        const imgHeight =
          (categoryCanvas.height * imgWidth) / categoryCanvas.width;

        pdf.addImage(
          categoryCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          currentY,
          imgWidth,
          imgHeight,
          "",
          "FAST"
        );

        currentY += imgHeight + 15;
      }

      // Step 5: Capture and add Summary section
      const summarySection = reportRef.current.querySelector(
        ".card-body:has(.fas.fa-list-alt)"
      );
      if (summarySection) {
        if (currentY + 100 > pageHeight) {
          pdf.addPage();
          currentY = margin;
        }

        const summaryCanvas = await html2canvas(summarySection, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === "dark" ? "#1a1d20" : "#ffffff",
        });

        const imgWidth = pageWidth - margin * 2;
        const imgHeight =
          (summaryCanvas.height * imgWidth) / summaryCanvas.width;

        pdf.addImage(
          summaryCanvas.toDataURL("image/png"),
          "PNG",
          margin,
          currentY,
          imgWidth,
          imgHeight,
          "",
          "FAST"
        );
      }

      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      }

      // Save the PDF
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

  // Helper utility functions for chart export
  const prepareLightModeChart = (chartElement) => {
    if (!chartElement) return;

    // Force everything to light mode for export
    const originalStyles = {
      background: chartElement.style.background,
      color: chartElement.style.color,
    };

    // Make all text black
    const allText = chartElement.querySelectorAll("text");
    allText.forEach((text) => {
      text.setAttribute("fill", "#000000");
    });

    // Make all grid lines light gray
    const gridLines = chartElement.querySelectorAll(".apexcharts-grid line");
    gridLines.forEach((line) => {
      line.setAttribute("stroke", "#e0e0e0");
    });

    // Fix area chart backgrounds
    const areaPaths = chartElement.querySelectorAll(".apexcharts-area");
    areaPaths.forEach((path) => {
      path.style.opacity = "0.6";
    });

    // Fix chart SVG background
    const svg = chartElement.querySelector(".apexcharts-svg");
    if (svg) {
      svg.style.background = "#ffffff";
    }

    return originalStyles;
  };

  // Function to export chart directly with modified styles
  const exportChartAsImage = (chartId, filename) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Chart element with ID ${chartId} not found`);
      return;
    }

    // Create a clone of the chart to avoid modifying the displayed one
    const chartClone = chartElement.cloneNode(true);
    chartClone.style.background = "#ffffff";

    // Position the clone off-screen
    chartClone.style.position = "absolute";
    chartClone.style.top = "-9999px";
    chartClone.style.left = "-9999px";
    document.body.appendChild(chartClone);

    // Force light mode styles on the clone
    prepareLightModeChart(chartClone);

    // Use html2canvas on the clone
    html2canvas(chartClone, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })
      .then((canvas) => {
        try {
          // Create and trigger download
          const link = document.createElement("a");
          link.download = `${filename}-${new Date().getTime()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();

          // Clean up
          document.body.removeChild(chartClone);
        } catch (error) {
          console.error("Error exporting chart:", error);
          document.body.removeChild(chartClone);
        }
      })
      .catch((error) => {
        console.error("Error capturing chart:", error);
        document.body.removeChild(chartClone);
      });
  };

  // Update chart configs to hide download button and use custom solution
  useEffect(() => {
    // Update chart configurations whenever theme or year changes
    const updatedMonthlyConfig = {
      ...monthlyEmissions,
      chart: {
        ...monthlyEmissions.chart,
        id: "monthly-emissions-chart",
        toolbar: {
          show: false, // Hide the native toolbar completely
        },
      },
    };

    const updatedCategoryConfig = {
      ...categoryEmissions,
      chart: {
        ...categoryEmissions.chart,
        id: "category-emissions-chart",
        toolbar: {
          show: false, // Hide the native toolbar completely
        },
      },
    };

    setMonthlyEmissions(updatedMonthlyConfig);
    setCategoryEmissions(updatedCategoryConfig);
  }, [theme, selectedYear]);

  // Function to open Jaaropgave export
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
                        theme === "dark"
                          ? "bg-dark text-light border-secondary"
                          : ""
                      }`}
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
                        No saved reports yet. Generate and save your first
                        report!
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
                              <i className="fas fa-id-card m-0 me-2"></i>Report
                              ID
                            </th>
                            <th>
                              <i className="fas fa-calendar me-2"></i>Year
                            </th>
                            <th>
                              <i className="fas fa-clock me-2"></i>Date Created
                            </th>
                            <th>
                              <i className="fas fa-chart-pie me-2"></i>Total
                              Emissions
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
                                  {(report.reportId || report._id).substring(
                                    0,
                                    8
                                  )}
                                  ...
                                </span>
                              </td>
                              <td>{report.year}</td>
                              <td>
                                {new Date(
                                  report.createdAt
                                ).toLocaleDateString()}
                              </td>
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
                                      confirmDeleteReport(
                                        report.reportId || report._id
                                      )
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
          </div>

          {reportData && (
            <div className="row" ref={reportSectionRef}>
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
                      <div className="col-md-4 mb-4">
                        <div
                          className={`card m-0 h-100 border-0 ${
                            theme === "dark"
                              ? "bg-dark-secondary text-light"
                              : "bg-light"
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
                              <div
                                className="progress"
                                style={{ height: "8px" }}
                              >
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

                      <div className="col-md-8 mb-4">
                        <div
                          className={`card m-0 h-100 border-0 ${
                            theme === "dark"
                              ? "bg-dark-secondary text-light"
                              : "bg-light"
                          }`}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="card-title fw-bold text-primary mb-0">
                                <i className="fas fa-chart-line me-2"></i>
                                Monthly Distribution
                              </h5>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  exportChartAsImage(
                                    "monthly-emissions-chart",
                                    "Monthly-CO2-Emissions"
                                  )
                                }
                                title="Download chart"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                            <div
                              className="monthly-emissions-chart"
                              id="monthly-emissions-chart"
                            >
                              <Chart
                                options={monthlyEmissions}
                                series={monthlyEmissions.series}
                                type="area"
                                height={320}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-4 flex-wrap">
                      <div className="flex-fill mb-4">
                        <div
                          className={`card m-0 h-100 border-0 ${
                            theme === "dark"
                              ? "bg-dark-secondary text-light"
                              : "bg-light"
                          }`}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="card-title fw-bold text-primary mb-0">
                                <i className="fas fa-chart-pie me-2"></i>
                                Emissions by Category
                              </h5>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  exportChartAsImage(
                                    "category-emissions-chart",
                                    "Category-CO2-Emissions"
                                  )
                                }
                                title="Download chart"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                            <div
                              className="category-emissions-chart"
                              id="category-emissions-chart"
                            >
                              <Chart
                                options={categoryEmissions}
                                series={categoryEmissionsSeries}
                                type="donut"
                                height={320}
                                width="100%"
                                className="w-100 d-flex justify-content-center align-items-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-fill mb-4">
                        <div
                          className={`card m-0 h-100 border-0 ${
                            theme === "dark"
                              ? "bg-dark-secondary text-light"
                              : "bg-light"
                          }`}
                        >
                          <div className="card-body">
                            <h5 className="card-title fw-bold text-primary mb-4">
                              <i className="fas fa-list-alt me-2"></i>
                              Summary
                            </h5>
                            <div className="table-responsive">
                              <table
                                className={`table ${
                                  theme === "dark" ? "table-dark" : ""
                                }`}
                              >
                                <tbody>
                                  <tr>
                                    <th scope="row" className="border-0">
                                      <i className="fas fa-calendar-alt me-2 text-primary"></i>
                                      Year
                                    </th>
                                    <td className="border-0 fw-bold">
                                      {reportData.year}
                                    </td>
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
                                        const maxValue = Math.max(
                                          ...reportData.categoryData
                                        );
                                        const maxIndex =
                                          reportData.categoryData.indexOf(
                                            maxValue
                                          );
                                        return (
                                          <>
                                            <span>
                                              {reportData.categories[maxIndex]}
                                            </span>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal - Update the styling to match the new design */}
      <div
        className={`modal fade ${showDeleteConfirm ? "show" : ""}`}
        style={{ display: showDeleteConfirm ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showDeleteConfirm}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className={`modal-content ${
              theme === "dark" ? "bg-dark text-light" : ""
            }`}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-trash-alt text-danger me-2"></i>
                Confirm Delete
              </h5>
              <button
                type="button"
                className={`btn-close ${
                  theme === "dark" ? "btn-close-white" : ""
                }`}
                aria-label="Close"
                onClick={() => setShowDeleteConfirm(false)}
              ></button>
            </div>
            <div className="modal-body py-4">
              <div className="d-flex align-items-center">
                <div className="text-danger me-3" style={{ fontSize: "2rem" }}>
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p className="mb-0">
                  Are you sure you want to delete this report? This action
                  cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <i className="fas fa-times me-2"></i>
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
                  <>
                    <i className="fas fa-trash-alt me-2"></i>
                    Delete Report
                  </>
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

      {/* Add the Modal for Jaaropgave Export */}
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
