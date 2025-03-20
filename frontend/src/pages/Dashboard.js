import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { REACT_APP_API_URL } from "../env";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DashboardPage = () => {
  const co2ReductionRef = useRef(null);
  const co2EmissionsByDateRef = useRef(null);
  const co2EmissionsByCategoryRef = useRef(null);
  const co2EmissionsTrendRef = useRef(null);

  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [emissionsCount, setEmissionsCount] = useState(0);
  const [vehicle, setVehicle] = useState(0);

  // Define theme-responsive chart colors
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

  const chartColors = getChartColors();

  // Common chart theme configuration
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

  const [co2Reduction, setco2Reduction] = useState({
    chart: {
      type: "line",
      zoom: { enabled: false },
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
    },
    title: {
      text: "CO₂ Reduction Over Time",
      style: {
        color: chartColors.titleColor,
        fontWeight: "bold",
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: chartColors.gridColor,
      row: {
        colors: ["transparent"],
      },
    },
    xaxis: {
      categories: [], // Initially empty, update dynamically
      labels: {
        rotate: -45, // Rotate labels for better visibility
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
        text: "Total Records",
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
      valueSuffix: " MT",
      style: {
        fontSize: "12px",
      },
    },
    legend: {
      labels: {
        colors: chartColors.legendColor,
      },
    },
    series: [
      {
        name: "Total Records",
        data: [],
      },
    ],
    credits: {
      enabled: false,
    },
  });

  const [co2EmissionsByDate, setCo2EmissionsByDate] = useState({
    chart: {
      type: "bar",
      zoom: { enabled: false },
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
    },
    title: {
      text: "CO₂ Emissions by Date",
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
      labels: {
        format: "dd-mm-yyy", // Format dates correctly
        rotate: -45, // Rotates labels for better readability
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
      labels: {
        style: {
          colors: chartColors.labelColor,
        },
      },
    },
    tooltip: {
      x: { format: "dd-mm-yyyy" },
      theme: theme === "dark" ? "dark" : "light",
      style: {
        fontSize: "12px",
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        distributed: true, // Different colors for each bar
      },
    },
    colors: [
      "#E74C3C",
      "#3498DB",
      "#2ECC71",
      "#F1C40F",
      "#9B59B6",
      "#1ABC9C",
      "#E67E22",
      "#D35400",
      "#34495E",
      "#7F8C8D",
    ],
    // dataLabels: { enabled: false },
    legend: {
      show: false, // Show only series name
      labels: {
        colors: chartColors.legendColor,
      },
    },
  });

  const [co2EmissionsByDateSeries, setCo2EmissionsByDateSeries] = useState([]);

  // CO2 Emissions by Category
  const [co2EmissionsByCategory, setco2EmissionsByCategory] = useState({
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
    labels: [],
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (val) => `${val} Tons`,
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

  const [co2EmissionsByCategorySeries, setco2EmissionsByCategorySeries] =
    useState([]);

  const [co2EmissionsTrend, setCo2EmissionsTrend] = useState({
    chart: {
      scrollablePlotArea: {
        minWidth: 100,
      },
      zoom: { enabled: false },
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
    },
    title: {
      text: "CO2 Emissions Trend ",
      align: "left",
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
    xAxis: {
      type: "datetime",
      tickInterval: 365 * 24 * 3600 * 1000, // 1 year interval
      labels: {
        format: "{value:%Y}", // Shows year (e.g., 2024, 2025)
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
    yaxis: [
      {
        title: {
          text: null,
        },
        labels: {
          align: "left",
          x: 3,
          y: 16,
          format: "{value:.,0f}",
          style: {
            colors: chartColors.labelColor,
          },
        },
        showFirstLabel: false,
      },
      {
        linkedTo: 0,
        gridLineWidth: 0,
        opposite: true,
        title: {
          text: null,
        },
        labels: {
          align: "right",
          x: -3,
          y: 16,
          format: "{value:.,0f}",
          style: {
            colors: chartColors.labelColor,
          },
        },
        showFirstLabel: false,
      },
    ],
    legend: {
      align: "left",
      verticalAlign: "top",
      borderWidth: 0,
      labels: {
        colors: chartColors.legendColor,
      },
    },
    tooltip: {
      shared: true,
      crosshairs: true,
      theme: theme === "dark" ? "dark" : "light",
      style: {
        fontSize: "12px",
      },
    },
    plotOptions: {
      series: {
        cursor: "pointer",
        className: "popup-on-click",
        marker: {
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: "CO₂ Emissions",
        data: [],
        // lineWidth: 4,
        // marker: {
        //   radius: 4,
        // },
      },
    ],
    stroke: {
      curve: "smooth",
      width: 3,
    },
  });

  // Update chart colors when theme changes
  useEffect(() => {
    const chartColors = getChartColors();
    const toolbarConfig = getToolbarConfig();
    const chartTheme = getChartTheme();

    setco2Reduction((prev) => ({
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
      grid: {
        borderColor: chartColors.gridColor,
        row: {
          colors: ["transparent"],
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
    }));

    setCo2EmissionsByDate((prev) => ({
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
      legend: {
        ...prev.legend,
        labels: {
          colors: chartColors.legendColor,
        },
      },
    }));

    setco2EmissionsByCategory((prev) => ({
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

    setCo2EmissionsTrend((prev) => ({
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
      yaxis: prev.yaxis.map((axis) => ({
        ...axis,
        labels: {
          ...axis.labels,
          style: {
            colors: chartColors.labelColor,
          },
        },
      })),
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
    }));
  }, [theme]);

  useEffect(() => {
    document.body.className = `${theme}-theme`;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (token && userObj) {
          setUserData(userObj);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const fetchData = async (url, errorMessage) => {
        try {
          const response = await fetch(url, { method: "GET", headers });
          if (!response.ok) {
            throw new Error(errorMessage);
          }
          return response.json();
        } catch (error) {
          console.error(errorMessage, error);
          return null;
        }
      };

      try {
        const [
          employeeData,
          companyData,
          emissionsData,
          vehiclesData,
          redutionOverTime,
          emissionsByDate,
          emissionsByCategory,
          emissionsTrend,
        ] = await Promise.all([
          fetchData(
            `${REACT_APP_API_URL}/employees`,
            "Failed to fetch employees"
          ),
          fetchData(
            `${REACT_APP_API_URL}/companies`,
            "Failed to fetch companies"
          ),
          fetchData(
            `${REACT_APP_API_URL}/emissions`,
            "Failed to fetch emissions"
          ),
          fetchData(
            `${REACT_APP_API_URL}/vehicles`,
            "Failed to fetch vehicles"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/redution-over-time`,
            "Failed to fetch redution-over-time"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-by-date`,
            "Failed to fetch emissions-by-date"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-by-category`,
            "Failed to fetch emissions-by-category"
          ),
          fetchData(
            `${REACT_APP_API_URL}/dashboard/emissions-trend`,
            "Failed to fetch emissions-trend"
          ),
        ]);

        console.log("API Responses:", {
          redutionOverTime,
          emissionsTrend,
          emissionsByCategory,
        });

        setEmployeeCount(employeeData?.length || 0);
        setCompanyCount(companyData?.length || 0);
        setEmissionsCount(emissionsData?.length || 0);
        setVehicle(vehiclesData?.length || 0);

        // **Handle undefined data before using map()**
        const dateArray = (redutionOverTime || []).map((item) => {
          if (!item?.date) return "";
          const [year, month] = item.date.split("-");
          return new Date(year, month - 1)
            .toLocaleString("en-US", { month: "short", year: "numeric" })
            .replace(" ", "-");
        });

        const recordsArray = (redutionOverTime || []).map(
          (item) => item.total_emission || 0
        );

        setco2Reduction((prev) => ({
          ...prev,
          xaxis: { ...prev.xaxis, categories: dateArray },
          series: [{ name: "Total Records", data: recordsArray }],
        }));

        const dateByArray = (emissionsByDate || []).map((item) => ({
          x: dateFormat(item?.date || ""),
          y: item?.total_emissions || 0,
        }));

        setCo2EmissionsByDateSeries([
          {
            name: "CO₂ Emissions",
            data: dateByArray,
          },
        ]);

        setco2EmissionsByCategory((prev) => ({
          ...prev,
          labels: (emissionsByCategory || []).map(
            (item) => item?.categoryTitle || ""
          ),
        }));

        setco2EmissionsByCategorySeries(
          (emissionsByCategory || []).map((item) => item?.totalEmissions || 0)
        );

        const emissionsDataArray = (emissionsTrend || []).map((item) => [
          item.year || "",
          item.totalEmissions || 0,
        ]);

        setCo2EmissionsTrend((prevState) => ({
          ...prevState,
          series: [{ ...prevState.series[0], data: emissionsDataArray }],
        }));
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };

    fetchUserData();
    fetchStats();
  }, [navigate, theme]);

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

  // Function to download chart as PDF
  const downloadPDF = (chartRef, title) => {
    if (!chartRef.current) return;
    const chartElement = chartRef.current;

    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
      pdf.save(`${title}.pdf`);
    });
  };

  const downloadAllPDFs = async () => {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const charts = [
      { ref: co2ReductionRef },
      { ref: co2EmissionsByDateRef },
      { ref: co2EmissionsByCategoryRef },
      { ref: co2EmissionsTrendRef },
    ];

    for (let i = 0; i < charts.length; i++) {
      const { ref } = charts[i];

      if (!ref.current) continue;

      const canvas = await html2canvas(ref.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i !== 0) pdf.addPage(); // Add a new page for each chart except the first
      pdf.setFontSize(16);
      pdf.addImage(imgData, "PNG", 10, 20, pdfWidth - 20, pdfHeight - 20);
    }

    pdf.save("All_CO2_Emissions_Charts.pdf");
  };

  const dateFormat = (date) => {
    const fullDate = new Date(date);
    const day = String(fullDate.getDate()).padStart(2, "0"); // Ensure two digits
    const month = String(fullDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = fullDate.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <nav
        className={`navbar navbar-expand-lg navbar-${theme} bg-${theme} mb-4`}
      >
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <div className="">
            <span className="navbar-brand d-flex align-items-center">
              <i className="fas fa-hand-peace me-2"></i>
              <div>
                <span
                  className="d-block"
                  style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                >
                  Welcome,{" "}
                  <span className="text-primary">{userData?.username}</span>
                </span>
                <span
                  className="d-block"
                  style={{ fontSize: "0.9rem", fontStyle: "italic" }}
                >
                  It's a great day to be productive! ✨
                </span>
              </div>
            </span>
          </div>
          <div className="d-flex">
            {/* Theme toggle button with icons */}
            <button
              className={`btn ${
                theme === "light" ? "btn-outline-dark" : "btn-outline-light"
              } me-2`}
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <i className="fas fa-moon"></i> // Moon icon for Dark Mode
              ) : (
                <i className="fas fa-sun"></i> // Sun icon for Light Mode
              )}
            </button>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container text-center">
        {/* Dashboard stats */}
        <div className="row g-4">
          {/* Employees Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-users fa-2x me-3"></i>
                <h4 className="card-title mb-0">Employees</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {employeeCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Employees</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100 shadow-sm"
                  onClick={() => navigate("/employees")}
                >
                  Manage Employees
                </button>
              </div>
            </div>
          </div>

          {/* Companies Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-building fa-2x me-3"></i>
                <h4 className="card-title mb-0">Companies</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {companyCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Companies</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/companies")}
                >
                  Manage Companies
                </button>
              </div>
            </div>
          </div>
          {/* Regular User Information 

           <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-users fa-2x me-3"></i>
                <h4 className="card-title mb-0">User</h4>
              </div>
              <div className="card-body text-center">
                <p className="card-text mt-2">
                  <span className="text-muted">User Information</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/user-dashboard")}
                >
                  Manage Regular User
                </button>
              </div>
            </div>
          </div> */}

          {/* Emission Records Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-chart-line fa-2x me-3"></i>
                <h4 className="card-title mb-0">Emission Records</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {emissionsCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Emissions</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/emissions")}
                >
                  View Emission Records
                </button>
              </div>
            </div>
          </div>
          {/* Emission Type Card */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-chart-line fa-2x me-3"></i>
                <h4 className="card-title mb-0">Emission Type</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">
                  {emissionsCount}
                </div>
                <p className="card-text mt-2">
                  <span className="text-muted">Emissions</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100"
                  onClick={() => navigate("/emission-types")}
                >
                  View Emission Type
                </button>
              </div>
            </div>
          </div>
          {/* Vehicle Card  */}
          <div className="col-md-4">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-header d-flex align-items-center">
                <i className="fas fa-car fa-2x me-3"></i>
                <h4 className="card-title mb-0">Vehicles</h4>
              </div>
              <div className="card-body text-center">
                <div className="display-4 font-weight-bold mt-2">{vehicle}</div>
                <p className="card-text mt-2">
                  <span className="text-muted">Total Vehicles</span>
                </p>
              </div>
              <div className="card-footer text-center">
                <button
                  className="btn btn-info w-100 shadow-sm"
                  onClick={() => navigate("/vehicles")}
                >
                  Manage Vehicles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* graph work */}

        <div className="row">
          <div className="col-12 mt-3">
            <button
              onClick={downloadAllPDFs}
              className="btn btn-info float-end mx-3 mt-3"
            >
              <i className="fas fa-file-pdf"></i> Download All Graphs
            </button>
          </div>
        </div>
        <div className="row mt-3 pb-5 row-gap-3">
          <div className="col-md-6">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2ReductionRef, "CO2 Reduction")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2ReductionRef}>
                    <Chart
                      className="mt-6 -mb-6"
                      options={co2Reduction}
                      series={co2Reduction.series}
                      type="line"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2EmissionsByDateRef, "CO2 Emissions By Date")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2EmissionsByDateRef}>
                    <Chart
                      className="mt-6 -mb-6"
                      options={co2EmissionsByDate}
                      series={co2EmissionsByDateSeries}
                      type="bar"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 mt-2">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2EmissionsByCategoryRef, "CO2 Emissions By Category")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2EmissionsByCategoryRef}>
                    <Chart
                      className="mt-6 -mb-6"
                      options={co2EmissionsByCategory}
                      series={co2EmissionsByCategorySeries}
                      type="pie"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mt-2">
            <div
              className={`card shadow-lg h-100 bg-${theme} text-${
                theme === "light" ? "dark" : "light"
              } rounded-3`}
            >
              <div className="card-body text-center">
                <div className="report-chart">
                  {/* <button onClick={() => downloadPDF(co2EmissionsTrendRef, "CO2 Emissions Trend")} className="graph-pdf-btn">
                    <i className="fas fa-file-pdf"></i>
                  </button> */}
                  <div className="" ref={co2EmissionsTrendRef}>
                    <Chart
                      options={co2EmissionsTrend}
                      series={co2EmissionsTrend.series}
                      type="line"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end graph work */}
      </div>
    </div>
  );
};

export default DashboardPage;
