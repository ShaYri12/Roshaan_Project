import { getChartColors, getChartTheme, getToolbarConfig } from "./chartUtils";

/**
 * Get configuration for CO2 Reduction chart
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} Chart configuration object
 */
export const getCO2ReductionConfig = (theme) => {
  const chartColors = getChartColors(theme);

  return {
    chart: {
      type: "line",
      zoom: { enabled: false }, // Disable zoom
      foreColor: chartColors.labelColor,
      background: theme === "dark" ? "#212529" : "transparent",
      toolbar: getToolbarConfig(theme),
      theme: getChartTheme(theme),
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
  };
};

/**
 * Get configuration for CO2 Emissions By Date chart
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} Chart configuration object
 */
export const getCO2EmissionsByDateConfig = (theme) => {
  const chartColors = getChartColors(theme);

  return {
    chart: {
      type: "bar",
      zoom: { enabled: false }, // Explicitly disable zoom
      foreColor: chartColors.labelColor,
      background: theme === "dark" ? "#212529" : "transparent",
      toolbar: getToolbarConfig(theme),
      theme: getChartTheme(theme),
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
  };
};

/**
 * Get configuration for CO2 Emissions By Category chart
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} Chart configuration object
 */
export const getCO2EmissionsByCategoryConfig = (theme) => {
  const chartColors = getChartColors(theme);

  return {
    chart: {
      type: "pie",
      zoom: { enabled: false }, // Explicitly disable zoom
      foreColor: chartColors.labelColor,
      background: theme === "dark" ? "#212529" : "transparent",
      toolbar: getToolbarConfig(theme),
      theme: getChartTheme(theme),
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
  };
};

/**
 * Get configuration for CO2 Emissions Trend chart
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} Chart configuration object
 */
export const getCO2EmissionsTrendConfig = (theme) => {
  const chartColors = getChartColors(theme);

  return {
    chart: {
      type: "line", // Explicitly set chart type
      zoom: { enabled: false }, // Disable zoom
      foreColor: chartColors.labelColor,
      background: theme === "dark" ? "#212529" : "transparent",
      toolbar: getToolbarConfig(theme),
      theme: getChartTheme(theme),
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
  };
};
