import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { REACT_APP_API_URL } from "../env";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../components/Sidebar";
import Leaderboard from "../components/Leaderboard";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Updated toolbar config with only download option
  const getToolbarConfig = () => {
    return {
      show: true,
      tools: {
        download: true,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
        selection: false,
      },
      export: {
        csv: {
          filename: "chart-data",
          columnDelimiter: ",",
          headerCategory: "Category",
          headerValue: "Value",
        },
        svg: {
          filename: "chart-svg",
        },
        png: {
          filename: "chart-png",
        },
      },
      autoSelected: "zoom", // This setting doesn't matter since zoom is disabled
    };
  };

  const [co2Reduction, setco2Reduction] = useState({
    chart: {
      type: "line",
      zoom: { enabled: false }, // Disable zoom
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 400,
        animateGradually: {
          enabled: true,
          delay: 100,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 250,
        },
      },
    },
    title: {
      text: "CO₂ Reduction Over Time",
      style: {
        color: chartColors.titleColor,
        fontWeight: "bold",
        fontSize: "16px",
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      lineCap: "round",
    },
    grid: {
      borderColor: chartColors.gridColor,
      row: {
        colors: ["transparent"],
        opacity: 0.5,
      },
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: [], // Initially empty, update dynamically
      labels: {
        rotate: -45, // Rotate labels for better visibility
        style: {
          colors: chartColors.labelColor,
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
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
        text: "CO₂ Reduction (Metric Tons)",
        style: {
          color: chartColors.labelColor,
          fontSize: "12px",
          fontWeight: "normal",
        },
      },
      labels: {
        style: {
          colors: chartColors.labelColor,
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
        },
        formatter: (value) => {
          return value.toFixed(0) + " MT";
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: theme === "dark" ? "dark" : "light",
      x: {
        show: true,
        format: "dd MMM yyyy",
      },
      y: {
        formatter: function (value) {
          return value.toFixed(2) + " MT";
        },
        title: {
          formatter: () => "CO₂ Reduction:",
        },
      },
      marker: {
        show: true,
        fillColors: ["#4CAF50"],
      },
      style: {
        fontSize: "12px",
        fontFamily: "Helvetica, Arial, sans-serif",
      },
      fixed: {
        enabled: false,
        position: "topRight",
        offsetX: 0,
        offsetY: 0,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: false,
      offsetY: -25,
      offsetX: -5,
      labels: {
        colors: chartColors.legendColor,
      },
    },
    series: [
      {
        name: "CO₂ Reduction",
        data: [],
      },
    ],
    responsive: [
      {
        breakpoint: 576,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
            offsetX: 0,
          },
        },
      },
    ],
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    colors: ["#4CAF50", "#F44336", "#2196F3"],
    markers: {
      size: 5,
      colors: ["#4CAF50"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
  });

  const [co2EmissionsByDate, setCo2EmissionsByDate] = useState({
    chart: {
      type: "bar",
      zoom: { enabled: false }, // Explicitly disable zoom
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 400,
        dynamicAnimation: {
          enabled: true,
          speed: 250,
        },
      },
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
      enabled: true,
      x: {
        show: true,
        format: "dd-mm-yyyy",
      },
      theme: theme === "dark" ? "dark" : "light",
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: function (value) {
          return value.toFixed(2) + " MT";
        },
        title: {
          formatter: () => "CO₂ Emissions:",
        },
      },
      fixed: {
        enabled: false,
        position: "topRight",
        offsetX: 0,
        offsetY: 0,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        distributed: true, // Different colors for each bar
        dataLabels: {
          position: "top",
        },
        borderRadius: 3,
        colors: {
          ranges: [
            {
              from: 0,
              to: 100000000,
              color: undefined, // Use the default color palette
            },
          ],
          backgroundBarColors: theme === "dark" ? ["#393e46"] : ["#f1f1f1"],
          backgroundBarOpacity: 0.1,
        },
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
    dataLabels: {
      enabled: false,
    },
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
      zoom: { enabled: false }, // Explicitly disable zoom
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 400,
        animateGradually: {
          enabled: true,
          delay: 100,
        },
      },
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
      enabled: true,
      theme: theme === "dark" ? "dark" : "light",
      fillSeriesColor: false,
      y: {
        formatter: function (val) {
          return val.toFixed(0) + " MT";
        },
        title: {
          formatter: function (seriesName) {
            return seriesName ? seriesName + ": " : "";
          },
        },
      },
      style: {
        fontSize: "12px",
      },
      fixed: {
        enabled: false,
        position: "topRight",
        offsetX: 0,
        offsetY: 0,
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Helvetica, Arial, sans-serif",
      offsetY: 8,
      itemMargin: {
        horizontal: 15,
        vertical: 5,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 6,
        offsetX: -5,
      },
      labels: {
        colors: chartColors.legendColor,
        useSeriesColors: false,
      },
      formatter: function (seriesName, opts) {
        return (
          seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + " MT"
        );
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
      colors: theme === "dark" ? ["#343a40"] : undefined,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "55%",
          labels: {
            show: false,
          },
        },
      },
    },
  });

  const [co2EmissionsByCategorySeries, setco2EmissionsByCategorySeries] =
    useState([]);

  const [co2EmissionsTrend, setCo2EmissionsTrend] = useState({
    chart: {
      type: "line", // Explicitly set chart type
      zoom: { enabled: false }, // Disable zoom
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(),
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 400,
        animateGradually: {
          enabled: true,
          delay: 100,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 250,
        },
      },
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
    xaxis: {
      type: "category", // Changed from datetime to category
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
        text: "CO₂ Emissions (Metric Tons)",
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
      enabled: true,
      shared: true,
      intersect: false,
      theme: theme === "dark" ? "dark" : "light",
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: function (value) {
          return value.toFixed(2) + " MT";
        },
        title: {
          formatter: () => "CO₂ Emissions:",
        },
      },
      marker: {
        show: true,
      },
      fixed: {
        enabled: false,
        position: "topRight",
        offsetX: 0,
        offsetY: 0,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: chartColors.legendColor,
      },
    },
    plotOptions: {
      series: {
        cursor: "default", // Change from pointer to default to indicate non-interactive
        marker: {
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: "CO₂ Emissions",
        data: [],
      },
    ],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 5,
      colors: undefined,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
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
        zoom: { enabled: false }, // Ensure zoom is disabled after theme change
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
        zoom: { enabled: false }, // Ensure zoom is disabled after theme change
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
        zoom: { enabled: false }, // Ensure zoom is disabled after theme change
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
        enabled: true,
        theme: theme === "dark" ? "dark" : "light",
        fillSeriesColor: false,
        y: {
          formatter: function (val) {
            return val.toFixed(0) + " MT";
          },
          title: {
            formatter: function (seriesName) {
              return seriesName ? seriesName + ": " : "";
            },
          },
        },
      },
      legend: {
        ...prev.legend,
        labels: {
          colors: chartColors.legendColor,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 1,
        colors: theme === "dark" ? ["#343a40"] : undefined,
      },
    }));

    setCo2EmissionsTrend((prev) => {
      // Preserve the existing categories and data
      const existingCategories = prev.xaxis?.categories || [];
      const existingData = prev.series[0]?.data || [];

      return {
        ...prev,
        chart: {
          ...prev.chart,
          zoom: { enabled: false }, // Ensure zoom is disabled after theme change
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
          categories: existingCategories,
          labels: {
            ...prev.xaxis?.labels,
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
            ...prev.yaxis.labels,
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
        series: [
          {
            name: "CO₂ Emissions",
            data: existingData,
          },
        ],
      };
    });
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

        // Handle CO2 Reduction Over Time data
        if (redutionOverTime && Array.isArray(redutionOverTime)) {
          const dateArray = redutionOverTime.map((item) => {
            if (!item?.date) return "";
            const [year, month] = item.date.split("-");
            return new Date(year, month - 1)
              .toLocaleString("en-US", { month: "short", year: "numeric" })
              .replace(" ", "-");
          });

          const recordsArray = redutionOverTime.map(
            (item) => item.total_emission || 0
          );

          setco2Reduction((prev) => ({
            ...prev,
            xaxis: { ...prev.xaxis, categories: dateArray },
            series: [{ name: "CO₂ Reduction", data: recordsArray }],
          }));
        }

        // Handle Emissions By Date data
        if (emissionsByDate && Array.isArray(emissionsByDate)) {
          const dateByArray = emissionsByDate.map((item) => ({
            x: dateFormat(item?.date || ""),
            y: item?.total_emissions || 0,
          }));

          setCo2EmissionsByDateSeries([
            {
              name: "CO₂ Emissions",
              data: dateByArray,
            },
          ]);
        }

        // Handle Emissions By Category data
        if (emissionsByCategory && Array.isArray(emissionsByCategory)) {
          const categoryLabels = emissionsByCategory.map(
            (item) => item?.categoryTitle || ""
          );
          const categoryValues = emissionsByCategory.map(
            (item) => item?.totalEmissions || 0
          );

          setco2EmissionsByCategory((prev) => ({
            ...prev,
            labels: categoryLabels,
          }));

          setco2EmissionsByCategorySeries(categoryValues);
        }

        // Handle Emissions Trend data
        if (emissionsTrend && Array.isArray(emissionsTrend)) {
          const years = emissionsTrend.map((item) => item.year || "");
          const emissions = emissionsTrend.map(
            (item) => item.totalEmissions || 0
          );

          setCo2EmissionsTrend((prevState) => ({
            ...prevState,
            xaxis: {
              ...prevState.xaxis,
              categories: years,
            },
            series: [
              {
                name: "CO₂ Emissions",
                data: emissions,
              },
            ],
          }));
        }
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
    localStorage.removeItem("userData");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  // Helper function to prepare chart for PDF export
  const prepareChartForExport = (chartRef) => {
    if (!chartRef.current) return;

    // Find toolbar elements and hide them
    const toolbar = chartRef.current.querySelector(".apexcharts-toolbar");
    if (toolbar) {
      toolbar.style.display = "none";
    }

    // Find tooltip elements and hide them
    const tooltips = chartRef.current.querySelectorAll(
      ".apexcharts-tooltip, .apexcharts-xaxistooltip, .apexcharts-yaxistooltip"
    );
    tooltips.forEach((tooltip) => {
      tooltip.style.display = "none";
      tooltip.style.opacity = "0";
    });

    // Set chart background to match theme with full opacity
    chartRef.current.style.background =
      theme === "dark" ? "#1e293b" : "#ffffff";
    chartRef.current.style.opacity = "1";

    // URGENT FIX: Force all line charts in light mode to be extremely visible
    if (theme === "light") {
      // First, apply special handling for the wrapper elements
      chartRef.current.classList.add("high-contrast-chart");

      // Apply a custom style directly to the chart container
      const customStyle = document.createElement("style");
      customStyle.setAttribute("id", "pdf-export-fixes");
      customStyle.innerHTML = `
        .apexcharts-line-series .apexcharts-line {
          stroke-width: 5px !important;
          stroke: #000000 !important;
          stroke-opacity: 1 !important;
        }
        .apexcharts-marker {
          stroke-width: 2px !important;
          stroke: #000000 !important;
          r: 5 !important;
        }
      `;
      document.head.appendChild(customStyle);

      // Find all SVG elements and apply extreme visibility enhancements
      const svgElements = chartRef.current.querySelectorAll("svg");
      svgElements.forEach((svg) => {
        // Add CSS class for additional styling
        svg.classList.add("pdf-export-svg");

        // Apply heavy contrast filter
        svg.style.filter = "contrast(2) brightness(1.2)";

        // Process all line series paths for maximum visibility
        const allLinePaths = svg.querySelectorAll(
          ".apexcharts-line-series path.apexcharts-line"
        );
        allLinePaths.forEach((path) => {
          // Force extremely visible styling for line paths
          path.style.stroke = "#000000";
          path.style.strokeWidth = "5px";
          path.style.strokeOpacity = "1";
          path.setAttribute("stroke", "#000000");
          path.setAttribute("stroke-width", "5");
        });

        // Make markers (dots on line charts) more visible
        const markers = svg.querySelectorAll(".apexcharts-marker");
        markers.forEach((marker) => {
          marker.style.stroke = "#000000";
          marker.style.fill = "#ffffff";
          marker.style.r = "5";
          marker.style.strokeWidth = "2";
          marker.setAttribute("stroke", "#000000");
          marker.setAttribute("fill", "#ffffff");
          marker.setAttribute("r", "5");
          marker.setAttribute("stroke-width", "2");
        });
      });
    }

    // Special handling for line chart containers in light mode
    if (theme === "light") {
      // Check if this is a line chart
      const isLineChart =
        chartRef.current.querySelector(".apexcharts-line-series") !== null ||
        chartRef.current.getAttribute("data-type") === "line";

      if (isLineChart) {
        // Find all line series containers
        const lineSeriesContainers = chartRef.current.querySelectorAll(
          ".apexcharts-line-series"
        );
        lineSeriesContainers.forEach((container) => {
          // Find all line paths within this container
          const linePaths = container.querySelectorAll("path.apexcharts-line");
          linePaths.forEach((path) => {
            // Force black color and thick stroke for all line paths
            path.style.stroke = "#000000";
            path.style.strokeWidth = "5px";
            path.style.strokeOpacity = "1";
            path.setAttribute("stroke", "#000000");
            path.setAttribute("stroke-width", "5");
          });
        });
      }
    }

    // Enhance opacity and contrast of SVG elements for better PDF rendering
    const svgElements = chartRef.current.querySelectorAll("svg");
    svgElements.forEach((svg) => {
      // Boost opacity of all elements
      svg.style.opacity = "1";

      // Apply heavy contrast filter for light mode
      if (theme === "light") {
        svg.style.filter = "contrast(2) brightness(1.2)";
      } else {
        svg.style.filter = "contrast(1.2) brightness(1.1)";
      }

      // Increase contrast of path elements (lines, areas, bars)
      const paths = svg.querySelectorAll("path");
      paths.forEach((path) => {
        const currentFill = path.getAttribute("fill");
        const currentStroke = path.getAttribute("stroke");

        // Make strokes more visible
        if (
          currentStroke &&
          currentStroke !== "none" &&
          !currentStroke.includes("transparent")
        ) {
          // Handle line chart paths differently for light and dark mode
          if (theme === "light") {
            // For light mode, use fixed dark colors for line chart strokes
            const isLinePath =
              path.classList.contains("apexcharts-line") ||
              path.closest(".apexcharts-line-series") !== null;

            if (isLinePath) {
              // Use a very dark color for line chart strokes in light mode
              path.style.stroke = "#000000"; // Black color for maximum visibility
              path.style.strokeWidth = "5px"; // Much thicker lines
              path.setAttribute("stroke", "#000000");
              path.setAttribute("stroke-width", "5");
            } else {
              // For other elements, apply moderate darkening
              if (isLightColor(currentStroke)) {
                path.style.stroke = makeDarker(currentStroke, 70);
              } else {
                path.style.stroke = currentStroke;
              }
              path.style.strokeWidth =
                Math.max(parseFloat(path.style.strokeWidth || 1) * 1.5, 2) +
                "px";
            }
          } else {
            // For dark mode, brighten as before
            path.style.stroke = makeBrighter(currentStroke, 10);
            path.style.strokeWidth =
              Math.max(parseFloat(path.style.strokeWidth || 1) * 1.2, 1.5) +
              "px";
          }
          path.style.strokeOpacity = "1";
        }

        // Make fills more visible
        if (
          currentFill &&
          currentFill !== "none" &&
          !currentFill.includes("transparent")
        ) {
          if (theme === "light") {
            if (isLightColor(currentFill)) {
              path.style.fill = makeDarker(currentFill, 40);
            }
          } else {
            path.style.fill = makeBrighter(currentFill, 10);
          }
          path.style.fillOpacity = "1";
        }
      });

      // Make the text more visible
      const textElements = svg.querySelectorAll("text");
      textElements.forEach((text) => {
        text.style.fontWeight = "bold";
        text.style.fontSize = "12px";
        if (theme === "light") {
          text.style.fill = "#000000";
        } else {
          text.style.fill = "#ffffff";
        }
        text.style.fillOpacity = "1";
      });
    });
  };

  // Function to make a color brighter
  const makeBrighter = (colorStr, percent) => {
    // Skip if not a valid color string
    if (!colorStr || typeof colorStr !== "string") return colorStr;

    try {
      // For hex colors
      if (colorStr.startsWith("#")) {
        let r = parseInt(colorStr.slice(1, 3), 16);
        let g = parseInt(colorStr.slice(3, 5), 16);
        let b = parseInt(colorStr.slice(5, 7), 16);

        r = Math.min(255, r + (255 - r) * (percent / 100));
        g = Math.min(255, g + (255 - g) * (percent / 100));
        b = Math.min(255, b + (255 - b) * (percent / 100));

        return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
          .toString(16)
          .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
      }

      // For rgb colors
      const rgbMatch = colorStr.match(
        /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
      );
      if (rgbMatch) {
        let r = parseInt(rgbMatch[1]);
        let g = parseInt(rgbMatch[2]);
        let b = parseInt(rgbMatch[3]);
        let a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;

        r = Math.min(255, r + (255 - r) * (percent / 100));
        g = Math.min(255, g + (255 - g) * (percent / 100));
        b = Math.min(255, b + (255 - b) * (percent / 100));

        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
          b
        )}, ${a})`;
      }
    } catch (e) {
      console.error("Error making color brighter:", e);
    }

    // Return original if couldn't process
    return colorStr;
  };

  // Function to make a color darker for light mode
  const makeDarker = (colorStr, percent) => {
    // Skip if not a valid color string
    if (!colorStr || typeof colorStr !== "string") return colorStr;

    try {
      // For hex colors
      if (colorStr.startsWith("#")) {
        let r = parseInt(colorStr.slice(1, 3), 16);
        let g = parseInt(colorStr.slice(3, 5), 16);
        let b = parseInt(colorStr.slice(5, 7), 16);

        r = Math.max(0, r * (1 - percent / 100));
        g = Math.max(0, g * (1 - percent / 100));
        b = Math.max(0, b * (1 - percent / 100));

        return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
          .toString(16)
          .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
      }

      // For rgb colors
      const rgbMatch = colorStr.match(
        /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
      );
      if (rgbMatch) {
        let r = parseInt(rgbMatch[1]);
        let g = parseInt(rgbMatch[2]);
        let b = parseInt(rgbMatch[3]);
        let a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;

        r = Math.max(0, r * (1 - percent / 100));
        g = Math.max(0, g * (1 - percent / 100));
        b = Math.max(0, b * (1 - percent / 100));

        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
          b
        )}, ${a})`;
      }
    } catch (e) {
      console.error("Error making color darker:", e);
    }

    // Return original if couldn't process
    return colorStr;
  };

  // Function to check if a color is light
  const isLightColor = (colorStr) => {
    try {
      let r, g, b;

      if (colorStr.startsWith("#")) {
        r = parseInt(colorStr.slice(1, 3), 16);
        g = parseInt(colorStr.slice(3, 5), 16);
        b = parseInt(colorStr.slice(5, 7), 16);
      } else {
        const rgbMatch = colorStr.match(
          /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
        );
        if (rgbMatch) {
          r = parseInt(rgbMatch[1]);
          g = parseInt(rgbMatch[2]);
          b = parseInt(rgbMatch[3]);
        } else {
          return false;
        }
      }

      // Calculate perceived brightness using the formula
      // (0.299*R + 0.587*G + 0.114*B)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      // Return true if the color is light (brightness > 128)
      return brightness > 128;
    } catch (e) {
      console.error("Error checking if color is light:", e);
      return false;
    }
  };

  // Helper function to reset chart after export
  const resetChartAfterExport = (chartRef, originalBg) => {
    if (!chartRef.current) return;

    // Remove custom style element if it exists
    const customStyle = document.getElementById("pdf-export-fixes");
    if (customStyle) {
      customStyle.remove();
    }

    // Remove high-contrast class
    chartRef.current.classList.remove("high-contrast-chart");

    // Find and show toolbar again
    const toolbar = chartRef.current.querySelector(".apexcharts-toolbar");
    if (toolbar) {
      toolbar.style.display = "flex";
    }

    // Reset background
    chartRef.current.style.background = originalBg;
    chartRef.current.style.opacity = "1";

    // Reset all SVG styling
    const svgElements = chartRef.current.querySelectorAll("svg");
    svgElements.forEach((svg) => {
      svg.classList.remove("pdf-export-svg");
      svg.style.filter = "none";
      svg.style.opacity = "1";

      // Find any duplicate paths created during export and remove them
      const duplicatePaths = svg.querySelectorAll(".duplicate-path");
      duplicatePaths.forEach((path) => path.remove());

      // Reset path styling
      const paths = svg.querySelectorAll("path");
      paths.forEach((path) => {
        path.style.stroke = "";
        path.style.strokeWidth = "";
        path.style.strokeOpacity = "";
        path.style.fill = "";
        path.style.fillOpacity = "";
      });

      // Reset marker styling
      const markers = svg.querySelectorAll(".apexcharts-marker");
      markers.forEach((marker) => {
        marker.style.stroke = "";
        marker.style.fill = "";
        marker.style.r = "";
        marker.style.strokeWidth = "";
      });

      // Reset text styling
      const textElements = svg.querySelectorAll("text");
      textElements.forEach((text) => {
        text.style.fontWeight = "";
        text.style.fontSize = "";
        text.style.fill = "";
        text.style.fillOpacity = "";
      });
    });
  };

  const downloadAllPDFs = async () => {
    if (isGeneratingPDF) return; // Prevent multiple clicks

    setIsGeneratingPDF(true);
    const pdf = new jsPDF("portrait", "mm", "a4");
    const charts = [
      { ref: co2ReductionRef, title: "CO₂ Reduction Over Time" },
      { ref: co2EmissionsByDateRef, title: "CO₂ Emissions By Date" },
      { ref: co2EmissionsByCategoryRef, title: "CO₂ Emissions By Category" },
      { ref: co2EmissionsTrendRef, title: "CO₂ Emissions Trend" },
    ];

    try {
      // Find all tooltips, dropdowns and menu elements that need to be hidden before screenshot
      const elementsToHide = document.querySelectorAll(
        ".apexcharts-tooltip, .apexcharts-menu, .apexcharts-menu-open, .apexcharts-toolbar, .apexcharts-xaxistooltip, .apexcharts-yaxistooltip, .apexcharts-zoom-menu"
      );

      // Store original display values to restore later
      const originalDisplayStyles = Array.from(elementsToHide).map((el) => {
        const originalStyle = window.getComputedStyle(el).display;
        el.style.display = "none";
        return { element: el, style: originalStyle };
      });

      // Boost rendering quality before capture
      const enhanceAllCharts = () => {
        const chartSvgs = document.querySelectorAll(".apexcharts-svg");
        chartSvgs.forEach((svg) => {
          // Improve overall quality
          svg.style.opacity = "1";
          svg.style.filter = "contrast(1.05)";

          // Enhance specific elements
          svg
            .querySelectorAll(".apexcharts-plot-series path, .apexcharts-area")
            .forEach((path) => {
              path.style.opacity = "1";
            });

          svg
            .querySelectorAll(
              ".apexcharts-grid-borders line, .apexcharts-grid line"
            )
            .forEach((line) => {
              line.style.strokeOpacity = "1";
            });

          svg.querySelectorAll("text").forEach((text) => {
            text.style.fontWeight = "500";
            text.style.opacity = "1";
          });
        });
      };

      // Enhance charts right before capture
      enhanceAllCharts();

      // Correct theme-based background colors for the charts
      const bgColor = theme === "dark" ? "#1e293b" : "#ffffff";

      for (let i = 0; i < charts.length; i++) {
        const { ref, title } = charts[i];

        if (!ref.current) continue;

        // Store original background for restoration later
        const originalBg = ref.current.style.background;
        const originalClasses = ref.current.className;

        // Prepare the chart for export (hide UI elements, set theme-appropriate background)
        prepareChartForExport(ref);

        // Temporarily add classes to ensure proper rendering
        ref.current.classList.add("pdf-export-mode");
        ref.current.classList.add("high-contrast-chart");

        // Make sure parent containers have proper backgrounds too
        const chartContainer = ref.current.closest(".chart-container");
        if (chartContainer) {
          chartContainer.style.background = bgColor;
          chartContainer.style.boxShadow = "none";
        }

        // Wait to ensure the chart is fully rendered with new styles
        await new Promise((resolve) => setTimeout(resolve, 400));

        const canvas = await html2canvas(ref.current, {
          scale: 3, // Higher scale for better quality
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          removeContainer: false, // Don't destroy the original element
          imageTimeout: 0, // No timeout
          letterRendering: true, // Improve text rendering
          onclone: (clonedDoc, clonedElement) => {
            // Additional handling for the cloned element to ensure all tooltips are hidden
            const clonedTooltips = clonedDoc.querySelectorAll(
              ".apexcharts-tooltip, .apexcharts-menu, .apexcharts-toolbar, .apexcharts-xaxistooltip, .apexcharts-yaxistooltip"
            );
            clonedTooltips.forEach((el) => {
              el.style.display = "none";
              el.style.opacity = "0";
              el.style.visibility = "hidden";
            });

            // Enhance quality of cloned chart for capture
            const svgs = clonedElement.querySelectorAll("svg");
            svgs.forEach((svg) => {
              svg.setAttribute("shape-rendering", "geometricPrecision");
              svg.setAttribute("text-rendering", "optimizeLegibility");

              // Make paths more visible
              svg.querySelectorAll("path").forEach((path) => {
                if (
                  path.getAttribute("stroke") &&
                  path.getAttribute("stroke") !== "none"
                ) {
                  const currentWidth = parseFloat(
                    path.getAttribute("stroke-width") || 1
                  );

                  // Detect line charts - look for specific SVG structure and classes
                  const isLineChart =
                    svg.closest(".apexcharts-line") !== null ||
                    svg.closest("[data-type='line']") !== null ||
                    clonedElement.querySelector(".apexcharts-line-series") !==
                      null;

                  if (theme === "light" && isLineChart) {
                    // For line charts in light mode - most aggressive approach
                    path.setAttribute("stroke", "#000000"); // Force black stroke for maximum visibility
                    path.setAttribute("stroke-width", "3.0"); // Very thick lines
                    path.setAttribute("stroke-opacity", "1");
                  } else {
                    // Increase stroke width more for light theme other paths
                    const strokeMultiplier = theme === "light" ? 2.0 : 1.5;
                    path.setAttribute(
                      "stroke-width",
                      (currentWidth * strokeMultiplier).toString()
                    );
                    path.setAttribute("stroke-opacity", "1");

                    // Ensure non-line chart strokes are also visible in light mode
                    if (theme === "light") {
                      const currentStroke = path.getAttribute("stroke");
                      if (currentStroke && isLightColor(currentStroke)) {
                        // For light-colored strokes in light mode, make them significantly darker
                        let darkerColor = makeDarker(currentStroke, 70);
                        path.setAttribute("stroke", darkerColor);
                      }
                    }
                  }
                }
                path.setAttribute("fill-opacity", "1");
              });

              // Enhance grid lines
              svg.querySelectorAll("line").forEach((line) => {
                line.setAttribute("stroke-opacity", "1");
              });

              // Make text clearer
              svg.querySelectorAll("text").forEach((text) => {
                text.setAttribute("font-weight", "bold");
                text.setAttribute("fill-opacity", "1");
              });
            });
          },
        });

        // Reset the chart to its original state
        resetChartAfterExport(ref, originalBg);
        ref.current.className = originalClasses;

        // Apply super-aggressive image processing for maximum contrast and brightness
        // Create a separate canvas for processing to not lose original data
        const processCanvas = document.createElement("canvas");
        processCanvas.width = canvas.width;
        processCanvas.height = canvas.height;
        const processCtx = processCanvas.getContext("2d");

        // Copy the original image to our processing canvas
        processCtx.drawImage(canvas, 0, 0);

        // Get image data for processing
        const imageData = processCtx.getImageData(
          0,
          0,
          processCanvas.width,
          processCanvas.height
        );
        const data = imageData.data;

        // Apply moderate contrast and brightness adjustments (reduced from previous aggressive values)
        // These more balanced values will keep charts clear without looking unnaturally bright
        const brightness = theme === "dark" ? 25 : 20; // Increased brightness for light mode
        const contrast = theme === "dark" ? 40 : 50; // Increased contrast for light mode

        for (let j = 0; j < data.length; j += 4) {
          // Skip fully transparent pixels
          if (data[j + 3] < 20) continue;

          // Apply more moderate contrast enhancement
          data[j] = limitValue(
            data[j] + brightness + (data[j] - 128) * (contrast / 100),
            0,
            255
          ); // Red
          data[j + 1] = limitValue(
            data[j + 1] + brightness + (data[j + 1] - 128) * (contrast / 100),
            0,
            255
          ); // Green
          data[j + 2] = limitValue(
            data[j + 2] + brightness + (data[j + 2] - 128) * (contrast / 100),
            0,
            255
          ); // Blue

          // Ensure full opacity for everything
          data[j + 3] = 255;
        }

        // Put the enhanced data back
        processCtx.putImageData(imageData, 0, 0);

        // Special handling for light theme line charts: detect and enhance line chart strokes
        if (
          theme === "light" &&
          (title.includes("Reduction") || title.includes("Trend"))
        ) {
          // For known line charts, get images for further processing
          const lineData = processCtx.getImageData(
            0,
            0,
            processCanvas.width,
            processCanvas.height
          );
          const linePixels = lineData.data;

          // Process for line chart - enhance dark pixels (likely the lines)
          for (let j = 0; j < linePixels.length; j += 4) {
            // Skip fully transparent pixels
            if (linePixels[j + 3] < 20) continue;

            // Check if this is a fairly dark pixel (likely a line or axis)
            // Calculate grayscale value
            const avg =
              (linePixels[j] + linePixels[j + 1] + linePixels[j + 2]) / 3;

            // If this is a dark pixel (likely part of a line)
            if (avg < 100) {
              // Make it completely black for maximum visibility
              linePixels[j] = 0; // R
              linePixels[j + 1] = 0; // G
              linePixels[j + 2] = 0; // B
              linePixels[j + 3] = 255; // A - fully opaque
            }
          }

          // Apply this enhanced line processing
          processCtx.putImageData(lineData, 0, 0);
        }

        // Apply additional image enhancements using composite operations with more subtle settings

        // Create the final canvas for maximum quality
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const finalCtx = finalCanvas.getContext("2d");

        // First draw the processed image
        finalCtx.drawImage(processCanvas, 0, 0);

        // Apply multiple enhancement layers with reduced intensity

        // 1. Apply overlay blend for increased contrast (adjusted based on theme)
        finalCtx.globalCompositeOperation = "overlay";
        finalCtx.globalAlpha = theme === "light" ? 0.25 : 0.15; // Stronger overlay for light mode
        finalCtx.drawImage(processCanvas, 0, 0);

        // 2. Sharpen by drawing the image slightly offset (reduced alpha from 0.6 to 0.4)
        finalCtx.globalCompositeOperation = "source-over";
        finalCtx.globalAlpha = theme === "light" ? 0.5 : 0.4; // Higher sharpening for light mode
        finalCtx.drawImage(
          processCanvas,
          0.5,
          0.5,
          canvas.width - 1,
          canvas.height - 1
        );

        // 3. Reset to normal drawing
        finalCtx.globalCompositeOperation = "source-over";
        finalCtx.globalAlpha = 1.0;

        // 4. Add a slight brightness or darkness boost layer based on theme
        if (theme === "dark") {
          finalCtx.fillStyle = "rgba(255,255,255,0.02)";
          finalCtx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // For light theme, add a stronger darkening layer to improve contrast
          finalCtx.fillStyle = "rgba(0,0,0,0.05)";
          finalCtx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Get final image data with maximum quality
        const imgData = finalCanvas.toDataURL("image/png", 1.0);

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i !== 0) pdf.addPage();

        // Add title with proper contrast
        pdf.setFontSize(16);
        pdf.setTextColor(theme === "dark" ? 255 : 0); // Maximum contrast for text
        pdf.text(title, 10, 20);

        // Add date
        pdf.setFontSize(10);
        pdf.setTextColor(theme === "dark" ? 220 : 60);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 28);

        // Add image with proper spacing
        pdf.addImage(imgData, "PNG", 10, 35, pdfWidth - 20, pdfHeight - 20);
      }

      // Restore original display styles
      originalDisplayStyles.forEach(({ element, style }) => {
        element.style.display = style;
      });

      pdf.save("All_CO2_Emissions_Charts.pdf");
    } catch (error) {
      console.error("Error generating PDFs:", error);

      // Make sure to restore any elements that might still be hidden
      document
        .querySelectorAll(
          ".apexcharts-tooltip, .apexcharts-menu, .apexcharts-toolbar"
        )
        .forEach((el) => {
          el.style.display = "";
        });

      // Ensure all charts are reset
      charts.forEach(({ ref }) => {
        if (ref.current) {
          ref.current.classList.remove("pdf-export-mode");
          ref.current.classList.remove("high-contrast-chart");
          resetChartAfterExport(ref);
        }
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper function to limit a value between min and max
  const limitValue = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
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
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container text-center">
          {/* Dashboard stats */}
          <div className="row g-4 ">
            {/* Employees Card */}
            <div className="col-xl-4 col-md-6">
              <div
                className={`card m-0 shadow-lg h-100 bg-${theme} text-${
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
            <div className="col-xl-4 col-md-6">
              <div
                className={`card m-0 shadow-lg h-100 bg-${theme} text-${
                  theme === "light" ? "dark" : "light"
                } rounded-3`}
              >
                <div className="card-header d-flex align-items-center">
                  <i className="fas fa-building fa-2x me-3"></i>
                  <h4 className="card-title mb-0 text-start">
                    Company Locations
                  </h4>
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

             <div className="col-xl-4 col-md-6">
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
            <div className="col-xl-4 col-md-6">
              <div
                className={`card m-0 shadow-lg h-100 bg-${theme} text-${
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
            <div className="col-xl-4 col-md-6">
              <div
                className={`card m-0 shadow-lg h-100 bg-${theme} text-${
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
            <div className="col-xl-4 col-md-6">
              <div
                className={`card m-0 shadow-lg h-100 bg-${theme} text-${
                  theme === "light" ? "dark" : "light"
                } rounded-3`}
              >
                <div className="card-header d-flex align-items-center">
                  <i className="fas fa-car fa-2x me-3"></i>
                  <h4 className="card-title mb-0">Vehicles</h4>
                </div>
                <div className="card-body text-center">
                  <div className="display-4 font-weight-bold mt-2">
                    {vehicle}
                  </div>
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
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-pdf"></i> Download All Graphs
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="row mt-3 pb-5 row-gap-3">
            <div className="col-lg-6">
              <div
                className={`card shadow-lg h-100 bg-${theme} text-${
                  theme === "light" ? "dark" : "light"
                } rounded-3`}
              >
                <div className="text-center">
                  <div className="report-chart position-relative">
                    <div className="chart-container" ref={co2ReductionRef}>
                      <Chart
                        className="mt-2"
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
            <div className="col-lg-6">
              <div
                className={`card shadow-lg h-100 bg-${theme} text-${
                  theme === "light" ? "dark" : "light"
                } rounded-3`}
              >
                <div className="text-center">
                  <div className="report-chart position-relative">
                    <div
                      className="chart-container"
                      ref={co2EmissionsByDateRef}
                    >
                      <Chart
                        className="mt-2"
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
            <div className="col-lg-6 mt-2">
              <div
                className={`card shadow-lg h-100 bg-${theme} text-${
                  theme === "light" ? "dark" : "light"
                } rounded-3`}
              >
                <div className="text-center">
                  <div className="report-chart position-relative">
                    <div
                      className="chart-container"
                      ref={co2EmissionsByCategoryRef}
                    >
                      <Chart
                        className="mt-2"
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

            <div className="col-lg-6 mt-2">
              <div
                className={`card shadow-lg h-100 bg-${theme} text-${
                  theme === "light" ? "dark" : "light"
                } rounded-3`}
              >
                <div className="text-center">
                  <div className="report-chart position-relative">
                    <div className="chart-container" ref={co2EmissionsTrendRef}>
                      <Chart
                        className="mt-2"
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

          {/* Energy Leaderboard */}
          <div className="col-xl-12 col-lg-12 col-md-12 mb-4">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
