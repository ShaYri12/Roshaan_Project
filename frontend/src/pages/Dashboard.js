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
    localStorage.clear();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  const downloadAllPDFs = async () => {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const charts = [
      { ref: co2ReductionRef, title: "CO₂ Reduction Over Time" },
      { ref: co2EmissionsByDateRef, title: "CO₂ Emissions By Date" },
      { ref: co2EmissionsByCategoryRef, title: "CO₂ Emissions By Category" },
      { ref: co2EmissionsTrendRef, title: "CO₂ Emissions Trend" },
    ];

    try {
      for (let i = 0; i < charts.length; i++) {
        const { ref, title } = charts[i];

        if (!ref.current) continue;

        const canvas = await html2canvas(ref.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i !== 0) pdf.addPage();

        // Add title
        pdf.setFontSize(16);
        pdf.setTextColor(theme === "dark" ? 200 : 50);
        pdf.text(title, 10, 20);

        // Add date
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 28);

        // Add image
        pdf.addImage(imgData, "PNG", 10, 35, pdfWidth - 20, pdfHeight - 20);
      }

      pdf.save("All_CO2_Emissions_Charts.pdf");
    } catch (error) {
      console.error("Error generating PDFs:", error);
    }
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
              >
                <i className="fas fa-file-pdf"></i> Download All Graphs
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
