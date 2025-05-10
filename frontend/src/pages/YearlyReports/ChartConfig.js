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

export const getChartTheme = (theme) => {
  return {
    mode: theme === "dark" ? "dark" : "light",
    palette: "palette1",
    monochrome: {
      enabled: false,
    },
  };
};

export const getToolbarConfig = () => {
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

// Monthly emissions chart configuration
export const getMonthlyEmissionsConfig = (theme, chartColors) => {
  return {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(theme),
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
      id: "monthly-emissions-chart",
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
  };
};

// Category emissions chart configuration
export const getCategoryEmissionsConfig = (theme, chartColors) => {
  return {
    chart: {
      type: "donut",
      foreColor: chartColors.labelColor,
      background: "transparent",
      toolbar: getToolbarConfig(),
      theme: getChartTheme(theme),
      fontFamily: "'Inter', 'Helvetica', sans-serif",
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
      id: "category-emissions-chart",
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
      style: {
        colors: theme === "dark" ? ["#fff"] : undefined,
      },
    },
    stroke: {
      width: 2,
      colors: theme === "dark" ? ["#343a40"] : ["#ffffff"],
    },
  };
};

// Chart export utilities
export const prepareLightModeChart = (chartElement) => {
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

export const exportChartAsImage = (chartId, filename) => {
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
  import("html2canvas").then((html2canvas) => {
    html2canvas
      .default(chartClone, {
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
  });
};
