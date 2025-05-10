/**
 * Chart utility functions for managing chart colors, themes, and toolbar configurations
 */

/**
 * Returns color configuration based on the current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} - Object containing color configurations for charts
 */
export const getChartColors = (theme) => {
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

/**
 * Returns chart theme configuration based on the current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} - Chart theme configuration object
 */
export const getChartTheme = (theme) => {
  return {
    mode: theme === "dark" ? "dark" : "light",
    palette: "palette1",
    monochrome: {
      enabled: false,
    },
  };
};

/**
 * Returns toolbar configuration for ApexCharts
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} - Toolbar configuration object
 */
export const getToolbarConfig = (theme) => {
  // Use the current theme's background color for exports
  const darkBgColor = "#1e293b"; // Dark theme background color

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
        backgroundColor: theme === "dark" ? darkBgColor : null,
      },
      png: {
        filename: "chart-png",
        backgroundColor: theme === "dark" ? darkBgColor : null,
      },
    },
    autoSelected: "zoom", // This setting doesn't matter since zoom is disabled
  };
};
