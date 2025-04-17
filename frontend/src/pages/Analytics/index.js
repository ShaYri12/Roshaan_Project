import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { REACT_APP_API_URL } from "../../env";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  FaQuestion,
  FaFileExport,
  FaFilter,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaTable,
} from "react-icons/fa";

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const AnalyticsPage = () => {
  const navigate = useNavigate();

  // State variables
  const [emissionsData, setEmissionsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("charts"); // 'charts' or 'table'
  const [activeChart, setActiveChart] = useState("bar"); // 'bar', 'line', 'pie'
  const [groupBy, setGroupBy] = useState("month");
  const [periodRange, setPeriodRange] = useState(12); // Last 12 months by default
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filter criteria
  const [filters, setFilters] = useState({
    dateFrom: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
    emissionType: "all",
    location: "all",
    employee: "all",
    minValue: "",
    maxValue: "",
  });

  // Options for filters
  const [filterOptions, setFilterOptions] = useState({
    emissionTypes: [],
    locations: [],
    employees: [],
  });

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        try {
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`
          );

          if (!response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          } else {
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
          }
        } catch (validationError) {
          console.error("Token validation error:", validationError);
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setError("Authentication failed. Please log in again.");
        navigate("/");
      }
    };

    checkAuth();
    document.body.className = `${theme}-theme`;

    // Fetch all necessary data
    fetchData();
  }, [navigate, theme]);

  // Fetch emissions and filter options data
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // For now, we'll use mock data

      // Mock emissions data
      const mockEmissions = generateMockEmissionsData();
      setEmissionsData(mockEmissions);

      // Extract filter options from mock data
      const emissionTypes = [
        ...new Set(mockEmissions.map((item) => item.type)),
      ];
      const locations = [
        ...new Set(mockEmissions.map((item) => item.location)),
      ];
      const employees = [
        ...new Set(mockEmissions.map((item) => item.employee)),
      ];

      setFilterOptions({
        emissionTypes,
        locations,
        employees,
      });

      // Apply initial filters
      applyFilters(mockEmissions, filters);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch analytics data");
      setLoading(false);
    }
  };

  // Generate mock emissions data for development
  const generateMockEmissionsData = () => {
    const mockData = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 2); // 2 years of data

    const emissionTypes = ["Scope 1", "Scope 2", "Scope 3"];
    const locations = [
      "Amsterdam",
      "Rotterdam",
      "Utrecht",
      "Eindhoven",
      "Groningen",
    ];
    const employees = [
      "John Doe",
      "Jane Smith",
      "Michael Johnson",
      "Emma Williams",
      "Robert Brown",
    ];

    // Generate a random date between start and end
    const randomDate = (start, end) => {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
    };

    // Generate 500 random emission records
    for (let i = 0; i < 500; i++) {
      const date = randomDate(startDate, today);
      const type =
        emissionTypes[Math.floor(Math.random() * emissionTypes.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const employee = employees[Math.floor(Math.random() * employees.length)];

      // Create value ranges by emission type
      let value;
      if (type === "Scope 1") {
        value = Math.random() * 20 + 5; // 5-25 tCO₂e
      } else if (type === "Scope 2") {
        value = Math.random() * 30 + 10; // 10-40 tCO₂e
      } else {
        value = Math.random() * 50 + 20; // 20-70 tCO₂e
      }

      mockData.push({
        id: i + 1,
        date: date.toISOString(),
        type,
        location,
        employee,
        value: parseFloat(value.toFixed(2)), // Emission value in tCO₂e
        source: Math.random() > 0.5 ? "Transport" : "Energy",
      });
    }

    return mockData;
  };

  // Apply filters to the data
  const applyFilters = (data = emissionsData, currentFilters = filters) => {
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.date);
      const fromDate = new Date(currentFilters.dateFrom);
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire end day

      // Date filter
      const dateMatches = itemDate >= fromDate && itemDate <= toDate;

      // Emission type filter
      const typeMatches =
        currentFilters.emissionType === "all" ||
        item.type === currentFilters.emissionType;

      // Location filter
      const locationMatches =
        currentFilters.location === "all" ||
        item.location === currentFilters.location;

      // Employee filter
      const employeeMatches =
        currentFilters.employee === "all" ||
        item.employee === currentFilters.employee;

      // Value range filter
      const minValueMatches =
        !currentFilters.minValue ||
        item.value >= parseFloat(currentFilters.minValue);
      const maxValueMatches =
        !currentFilters.maxValue ||
        item.value <= parseFloat(currentFilters.maxValue);

      return (
        dateMatches &&
        typeMatches &&
        locationMatches &&
        employeeMatches &&
        minValueMatches &&
        maxValueMatches
      );
    });

    setFilteredData(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(updatedFilters);
    applyFilters(emissionsData, updatedFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters = {
      dateFrom: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString()
        .split("T")[0],
      dateTo: new Date().toISOString().split("T")[0],
      emissionType: "all",
      location: "all",
      employee: "all",
      minValue: "",
      maxValue: "",
    };
    setFilters(defaultFilters);
    applyFilters(emissionsData, defaultFilters);
  };

  // Group data for charts
  const groupDataForCharts = () => {
    if (!filteredData.length) return { labels: [], datasets: [] };

    let groups = {};
    let labelFormat;

    // Group by selected time period
    filteredData.forEach((item) => {
      const date = new Date(item.date);
      let groupKey;

      if (groupBy === "day") {
        groupKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
        labelFormat = (date) => new Date(date).toLocaleDateString();
      } else if (groupBy === "month") {
        groupKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`; // YYYY-MM
        labelFormat = (key) => {
          const [year, month] = key.split("-");
          return new Date(
            parseInt(year),
            parseInt(month) - 1,
            1
          ).toLocaleDateString(undefined, { month: "short", year: "numeric" });
        };
      } else if (groupBy === "quarter") {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        groupKey = `${date.getFullYear()}-Q${quarter}`;
        labelFormat = (key) => key; // Already formatted
      } else if (groupBy === "year") {
        groupKey = date.getFullYear().toString();
        labelFormat = (key) => key; // Already formatted
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          total: 0,
          scope1: 0,
          scope2: 0,
          scope3: 0,
          transport: 0,
          energy: 0,
        };
      }

      groups[groupKey].total += item.value;

      // Add to specific emission type
      if (item.type === "Scope 1") groups[groupKey].scope1 += item.value;
      else if (item.type === "Scope 2") groups[groupKey].scope2 += item.value;
      else if (item.type === "Scope 3") groups[groupKey].scope3 += item.value;

      // Add to source type
      if (item.source === "Transport") groups[groupKey].transport += item.value;
      else if (item.source === "Energy") groups[groupKey].energy += item.value;
    });

    // Sort the keys by date
    const sortedKeys = Object.keys(groups).sort();

    // Limit to last N periods if needed
    const limitedKeys = periodRange
      ? sortedKeys.slice(-periodRange)
      : sortedKeys;

    // Create datasets for each chart type
    if (activeChart === "bar" || activeChart === "line") {
      return {
        labels: limitedKeys.map((key) => labelFormat(key)),
        datasets: [
          {
            label: "Scope 1",
            data: limitedKeys.map((key) =>
              parseFloat(groups[key].scope1.toFixed(2))
            ),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Scope 2",
            data: limitedKeys.map((key) =>
              parseFloat(groups[key].scope2.toFixed(2))
            ),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Scope 3",
            data: limitedKeys.map((key) =>
              parseFloat(groups[key].scope3.toFixed(2))
            ),
            backgroundColor: "rgba(255, 206, 86, 0.6)",
            borderColor: "rgba(255, 206, 86, 1)",
            borderWidth: 1,
          },
        ],
      };
    } else if (activeChart === "pie") {
      // For pie chart, aggregate all data
      const totals = limitedKeys.reduce(
        (acc, key) => {
          acc.scope1 += groups[key].scope1;
          acc.scope2 += groups[key].scope2;
          acc.scope3 += groups[key].scope3;
          return acc;
        },
        { scope1: 0, scope2: 0, scope3: 0 }
      );

      return {
        labels: ["Scope 1", "Scope 2", "Scope 3"],
        datasets: [
          {
            data: [
              parseFloat(totals.scope1.toFixed(2)),
              parseFloat(totals.scope2.toFixed(2)),
              parseFloat(totals.scope3.toFixed(2)),
            ],
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    return { labels: [], datasets: [] };
  };

  // Generate summary data
  const generateSummaryData = () => {
    if (!filteredData.length) return {};

    const totalEmissions = filteredData.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const scope1Emissions = filteredData
      .filter((item) => item.type === "Scope 1")
      .reduce((sum, item) => sum + item.value, 0);
    const scope2Emissions = filteredData
      .filter((item) => item.type === "Scope 2")
      .reduce((sum, item) => sum + item.value, 0);
    const scope3Emissions = filteredData
      .filter((item) => item.type === "Scope 3")
      .reduce((sum, item) => sum + item.value, 0);
    const transportEmissions = filteredData
      .filter((item) => item.source === "Transport")
      .reduce((sum, item) => sum + item.value, 0);
    const energyEmissions = filteredData
      .filter((item) => item.source === "Energy")
      .reduce((sum, item) => sum + item.value, 0);

    return {
      totalEmissions: parseFloat(totalEmissions.toFixed(2)),
      scope1Emissions: parseFloat(scope1Emissions.toFixed(2)),
      scope2Emissions: parseFloat(scope2Emissions.toFixed(2)),
      scope3Emissions: parseFloat(scope3Emissions.toFixed(2)),
      transportEmissions: parseFloat(transportEmissions.toFixed(2)),
      energyEmissions: parseFloat(energyEmissions.toFixed(2)),
      recordCount: filteredData.length,
    };
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (!filteredData.length) return;

    // Create CSV header
    const headers = [
      "Date",
      "Type",
      "Location",
      "Employee",
      "Source",
      "Value (tCO₂e)",
    ];

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item) =>
        [
          new Date(item.date).toLocaleDateString(),
          item.type,
          item.location,
          item.employee,
          item.source,
          item.value,
        ].join(",")
      ),
    ].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `emission-analytics-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle sidebar functionality
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

  // Get chart component based on active chart type
  const getChartComponent = () => {
    const chartData = groupDataForCharts();

    if (activeChart === "bar") {
      return (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Emissions by Type",
                font: { size: 16 },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.parsed.y} tCO₂e`;
                  },
                },
              },
              legend: {
                position: "top",
              },
            },
            scales: {
              y: {
                stacked: false,
                title: {
                  display: true,
                  text: "Emissions (tCO₂e)",
                },
              },
              x: {
                stacked: false,
                title: {
                  display: true,
                  text: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
                },
              },
            },
          }}
        />
      );
    } else if (activeChart === "line") {
      return (
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Emissions Trend",
                font: { size: 16 },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.parsed.y} tCO₂e`;
                  },
                },
              },
              legend: {
                position: "top",
              },
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: "Emissions (tCO₂e)",
                },
              },
              x: {
                title: {
                  display: true,
                  text: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
                },
              },
            },
          }}
        />
      );
    } else if (activeChart === "pie") {
      return (
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Emissions Distribution",
                font: { size: 16 },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = total
                      ? Math.round((value / total) * 100)
                      : 0;
                    return `${label}: ${value} tCO₂e (${percentage}%)`;
                  },
                },
              },
              legend: {
                position: "top",
              },
            },
          }}
        />
      );
    }

    return null;
  };

  // Render summary cards
  const renderSummaryCards = () => {
    const summary = generateSummaryData();

    return (
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <h3 className="text-primary mb-0">{summary.totalEmissions}</h3>
              <p className="text-muted">Total tCO₂e</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="d-flex justify-content-between w-100">
                <div className="text-center flex-grow-1">
                  <h5 className="mb-0">{summary.scope1Emissions}</h5>
                  <small className="text-muted">Scope 1</small>
                </div>
                <div className="text-center flex-grow-1">
                  <h5 className="mb-0">{summary.scope2Emissions}</h5>
                  <small className="text-muted">Scope 2</small>
                </div>
                <div className="text-center flex-grow-1">
                  <h5 className="mb-0">{summary.scope3Emissions}</h5>
                  <small className="text-muted">Scope 3</small>
                </div>
              </div>
              <p className="text-muted mt-2">Emissions by Scope (tCO₂e)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="d-flex justify-content-between w-100">
                <div className="text-center flex-grow-1">
                  <h5 className="mb-0">{summary.transportEmissions}</h5>
                  <small className="text-muted">Transport</small>
                </div>
                <div className="text-center flex-grow-1">
                  <h5 className="mb-0">{summary.energyEmissions}</h5>
                  <small className="text-muted">Energy</small>
                </div>
              </div>
              <p className="text-muted mt-2">Emissions by Source (tCO₂e)</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column align-items-center">
              <h3 className="text-info mb-0">{summary.recordCount}</h3>
              <p className="text-muted">Total Records</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="d-flex">
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="container-fluid px-4">
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Emissions Analytics Dashboard</h2>
                <div className="d-flex">
                  <Button
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  >
                    <FaFilter className="me-1" />{" "}
                    {isFilterPanelOpen ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={exportToCSV}
                    disabled={!filteredData.length}
                  >
                    <FaFileExport className="me-1" /> Export CSV
                  </Button>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Filter Panel */}
              {isFilterPanelOpen && (
                <Card className="mb-4">
                  <Card.Body>
                    <h5 className="mb-3">Filter Data</h5>
                    <Form>
                      <Row>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date From</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateFrom"
                              value={filters.dateFrom}
                              onChange={handleFilterChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Date To</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateTo"
                              value={filters.dateTo}
                              onChange={handleFilterChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Emission Type</Form.Label>
                            <Form.Select
                              name="emissionType"
                              value={filters.emissionType}
                              onChange={handleFilterChange}
                            >
                              <option value="all">All Types</option>
                              {filterOptions.emissionTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Select
                              name="location"
                              value={filters.location}
                              onChange={handleFilterChange}
                            >
                              <option value="all">All Locations</option>
                              {filterOptions.locations.map((location) => (
                                <option key={location} value={location}>
                                  {location}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Employee</Form.Label>
                            <Form.Select
                              name="employee"
                              value={filters.employee}
                              onChange={handleFilterChange}
                            >
                              <option value="all">All Employees</option>
                              {filterOptions.employees.map((employee) => (
                                <option key={employee} value={employee}>
                                  {employee}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Min Value (tCO₂e)</Form.Label>
                            <Form.Control
                              type="number"
                              name="minValue"
                              value={filters.minValue}
                              onChange={handleFilterChange}
                              placeholder="Min"
                              min="0"
                              step="0.01"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label>Max Value (tCO₂e)</Form.Label>
                            <Form.Control
                              type="number"
                              name="maxValue"
                              value={filters.maxValue}
                              onChange={handleFilterChange}
                              placeholder="Max"
                              min="0"
                              step="0.01"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                          <Button
                            variant="secondary"
                            className="mb-3 w-100"
                            onClick={resetFilters}
                          >
                            Reset Filters
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {/* Summary Cards */}
              {!loading && renderSummaryCards()}

              {/* Chart/Table View Selector */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="btn-group">
                  <Button
                    variant={
                      activeView === "charts" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveView("charts")}
                  >
                    <FaChartBar className="me-1" /> Charts
                  </Button>
                  <Button
                    variant={
                      activeView === "table" ? "primary" : "outline-primary"
                    }
                    onClick={() => setActiveView("table")}
                  >
                    <FaTable className="me-1" /> Table View
                  </Button>
                </div>

                {activeView === "charts" && (
                  <div className="d-flex align-items-center">
                    <div className="btn-group me-3">
                      <Button
                        variant={
                          activeChart === "bar" ? "info" : "outline-info"
                        }
                        onClick={() => setActiveChart("bar")}
                      >
                        <FaChartBar />
                      </Button>
                      <Button
                        variant={
                          activeChart === "line" ? "info" : "outline-info"
                        }
                        onClick={() => setActiveChart("line")}
                      >
                        <FaChartLine />
                      </Button>
                      <Button
                        variant={
                          activeChart === "pie" ? "info" : "outline-info"
                        }
                        onClick={() => setActiveChart("pie")}
                      >
                        <FaChartPie />
                      </Button>
                    </div>

                    {(activeChart === "bar" || activeChart === "line") && (
                      <>
                        <Form.Select
                          className="me-2"
                          style={{ width: "auto" }}
                          value={groupBy}
                          onChange={(e) => setGroupBy(e.target.value)}
                        >
                          <option value="day">Group by Day</option>
                          <option value="month">Group by Month</option>
                          <option value="quarter">Group by Quarter</option>
                          <option value="year">Group by Year</option>
                        </Form.Select>

                        <Form.Select
                          style={{ width: "auto" }}
                          value={periodRange}
                          onChange={(e) =>
                            setPeriodRange(parseInt(e.target.value) || 0)
                          }
                        >
                          <option value="0">All Periods</option>
                          <option value="6">Last 6 {groupBy}s</option>
                          <option value="12">Last 12 {groupBy}s</option>
                          <option value="24">Last 24 {groupBy}s</option>
                        </Form.Select>

                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              Select how to group the data and how many periods
                              to display
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="link"
                            className="text-muted p-0 ms-2"
                          >
                            <FaQuestion size={14} />
                          </Button>
                        </OverlayTrigger>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content */}
              {loading ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="alert alert-info" role="alert">
                  No data found for the selected filters. Please adjust your
                  criteria.
                </div>
              ) : activeView === "charts" ? (
                <Card>
                  <Card.Body>
                    <div style={{ height: "500px" }}>{getChartComponent()}</div>
                  </Card.Body>
                </Card>
              ) : (
                <Card>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Emission Type</th>
                            <th>Location</th>
                            <th>Employee</th>
                            <th>Source</th>
                            <th>Value (tCO₂e)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.slice(0, 100).map((item) => (
                            <tr key={item.id}>
                              <td>
                                {new Date(item.date).toLocaleDateString()}
                              </td>
                              <td>{item.type}</td>
                              <td>{item.location}</td>
                              <td>{item.employee}</td>
                              <td>{item.source}</td>
                              <td>{item.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {filteredData.length > 100 && (
                        <div className="text-center text-muted mt-2">
                          Showing 100 of {filteredData.length} records. Export
                          to CSV to view all data.
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
