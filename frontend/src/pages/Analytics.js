import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Table,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import EmployeeSelect from "../components/EmployeeSelect";
import CarsSelect from "../components/CarsSelect";
import {
  FaDownload,
  FaFilter,
  FaChartBar,
  FaChartPie,
  FaChartLine,
} from "react-icons/fa";
import { formatDecimal } from "../utils/dateUtils";

const AnalyticsPage = () => {
  const [emissions, setEmissions] = useState([]);
  const [filteredEmissions, setFilteredEmissions] = useState([]);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Added states for dropdown data
  const [employees, setEmployees] = useState([]);
  const [transportations, setTransportations] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employees: [],
    transportations: [],
    minEmissions: "",
    maxEmissions: "",
  });

  // Chart type state
  const [selectedChart, setSelectedChart] = useState("line");

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/auth/validate-token`,
          { method: "GET" }
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
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch emissions data and reference data for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emissionsResponse, employeesResponse, transportationsResponse] =
          await Promise.all([
            authenticatedFetch(`${REACT_APP_API_URL}/emissions?global=true`, {
              method: "GET",
            }),
            authenticatedFetch(`${REACT_APP_API_URL}/employees`, {
              method: "GET",
            }),
            authenticatedFetch(`${REACT_APP_API_URL}/transportations`, {
              method: "GET",
            }),
          ]);

        const [emissionsData, employeesData, transportationsData] =
          await Promise.all([
            emissionsResponse.json(),
            employeesResponse.json(),
            transportationsResponse.json(),
          ]);

        setEmissions(emissionsData);
        setFilteredEmissions(emissionsData);
        setEmployees(employeesData);
        setTransportations(transportationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // Apply filters to emissions data
  const applyFilters = () => {
    let filteredData = [...emissions];
    console.log("Original data count:", filteredData.length);

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredData = filteredData.filter(
        (item) => new Date(item.date) >= startDate
      );
      console.log("After start date filter:", filteredData.length);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      // Add one day to include the end date fully
      endDate.setDate(endDate.getDate() + 1);
      filteredData = filteredData.filter(
        (item) => new Date(item.date) < endDate
      );
      console.log("After end date filter:", filteredData.length);
    }

    // Filter by employees
    if (filters.employees && filters.employees.length > 0) {
      const employeeIds = filters.employees.map((emp) => emp.value);
      // Check if we're filtering by employee._id or employeeId
      filteredData = filteredData.filter((item) => {
        // Check for both possible property structures
        if (item.employee && item.employee._id) {
          return employeeIds.includes(item.employee._id);
        } else if (item.employeeId) {
          return employeeIds.includes(item.employeeId);
        }
        return false;
      });
      console.log("After employee filter:", filteredData.length);
    }

    // Filter by transportation types
    if (filters.transportations && filters.transportations.length > 0) {
      const transportationIds = filters.transportations.map((t) => t.value);
      // Check if we're filtering by transportation._id, transportationId, or transportationType
      filteredData = filteredData.filter((item) => {
        // Check for all possible property structures
        if (item.transportation && item.transportation._id) {
          return transportationIds.includes(item.transportation._id);
        } else if (item.transportationId) {
          return transportationIds.includes(item.transportationId);
        } else if (item.transportationType) {
          return transportationIds.includes(item.transportationType);
        }
        return false;
      });
      console.log("After transportation filter:", filteredData.length);
    }

    // Filter by min emissions
    if (filters.minEmissions) {
      const minValue = parseFloat(filters.minEmissions);
      if (!isNaN(minValue)) {
        filteredData = filteredData.filter((item) => {
          // Check for both possible property names: emissionsKg or co2Used
          const value = parseFloat(item.emissionsKg || item.co2Used || 0);
          return value >= minValue;
        });
        console.log("After min emissions filter:", filteredData.length);
      }
    }

    // Filter by max emissions
    if (filters.maxEmissions) {
      const maxValue = parseFloat(filters.maxEmissions);
      if (!isNaN(maxValue)) {
        filteredData = filteredData.filter((item) => {
          // Check for both possible property names: emissionsKg or co2Used
          const value = parseFloat(item.emissionsKg || item.co2Used || 0);
          return value <= maxValue;
        });
        console.log("After max emissions filter:", filteredData.length);
      }
    }

    setFilteredEmissions(filteredData);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      employees: [],
      transportations: [],
      minEmissions: "",
      maxEmissions: "",
    });
    // Reset to all emissions
    setFilteredEmissions(emissions);
  };

  // Update filtered emissions when emissions data changes
  useEffect(() => {
    if (emissions.length > 0) {
      setFilteredEmissions(emissions);
    }
  }, [emissions]);

  // Handle employee select change
  const handleEmployeeChange = (selectedOptions) => {
    console.log("Employee selection changed to:", selectedOptions);
    setFilters({
      ...filters,
      employees: selectedOptions || [],
    });
  };

  // Handle transportation select change
  const handleTransportationChange = (selectedOptions) => {
    console.log("Transportation selection changed to:", selectedOptions);
    setFilters({
      ...filters,
      transportations: selectedOptions || [],
    });
  };

  // Handle regular input changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Export data as CSV
  const exportCSV = () => {
    const headers = [
      "Date",
      "Employee",
      "Transportation",
      "Distance (km)",
      "CO₂ Used (kg)",
      "Start Location",
      "End Location",
    ];

    const csvData = [
      headers.join(","),
      ...filteredEmissions.map((e) =>
        [
          new Date(e.date).toLocaleDateString(),
          `${e.employee?.firstName} ${e.employee?.lastName}`,
          e.transportation?.name,
          e.distance,
          e.co2Used,
          e.startLocation.address,
          e.endLocation.address,
        ]
          .map((val) => `"${val}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emissions_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (filteredEmissions.length === 0) {
      // Return empty data if no emissions
      return {
        monthly: {
          labels: [],
          datasets: [
            {
              label: "Monthly CO₂ Emissions (kg)",
              data: [],
              backgroundColor:
                theme === "dark"
                  ? "rgba(75, 192, 192, 0.3)"
                  : "rgba(54, 162, 235, 0.3)",
              borderColor:
                theme === "dark"
                  ? "rgba(75, 192, 192, 1)"
                  : "rgba(54, 162, 235, 1)",
              borderWidth: 2,
              pointBackgroundColor:
                theme === "dark"
                  ? "rgba(75, 192, 192, 1)"
                  : "rgba(54, 162, 235, 1)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor:
                theme === "dark"
                  ? "rgba(75, 192, 192, 1)"
                  : "rgba(54, 162, 235, 1)",
            },
          ],
        },
        transport: {
          labels: [],
          datasets: [
            {
              label: "Emissions by Transportation Type",
              data: [],
              backgroundColor: [],
              borderWidth: 1,
            },
          ],
        },
      };
    }

    // Group data by month
    const monthlyData = filteredEmissions.reduce((acc, emission) => {
      const emissionDate = new Date(emission.date);
      if (!isNaN(emissionDate.getTime())) {
        // Check if date is valid
        const month = emissionDate.toLocaleString("default", {
          month: "long",
        });
        // Use co2Used or emissionsKg, whichever is available
        const emissionValue = parseFloat(
          emission.co2Used || emission.emissionsKg || 0
        );
        acc[month] = (acc[month] || 0) + emissionValue;
      }
      return acc;
    }, {});

    // Group data by transportation type
    const transportData = filteredEmissions.reduce((acc, emission) => {
      // Handle different data structures for transportation
      let transportName = "Unknown";

      if (emission.transportation && emission.transportation.name) {
        transportName = emission.transportation.name;
      } else if (emission.transportationType) {
        transportName = emission.transportationType;
      }

      // Use co2Used or emissionsKg, whichever is available
      const emissionValue = parseFloat(
        emission.co2Used || emission.emissionsKg || 0
      );
      acc[transportName] = (acc[transportName] || 0) + emissionValue;
      return acc;
    }, {});

    // Colors for transportation types
    const backgroundColors = [
      "rgba(75, 192, 192, 0.7)",
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(201, 203, 207, 0.7)",
    ];

    const borderColors = [
      "rgba(75, 192, 192, 1)",
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(201, 203, 207, 1)",
    ];

    return {
      monthly: {
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: "Monthly CO₂ Emissions (kg)",
            data: Object.values(monthlyData),
            backgroundColor:
              theme === "dark"
                ? "rgba(75, 192, 192, 0.3)"
                : "rgba(54, 162, 235, 0.3)",
            borderColor:
              theme === "dark"
                ? "rgba(75, 192, 192, 1)"
                : "rgba(54, 162, 235, 1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor:
              theme === "dark"
                ? "rgba(75, 192, 192, 1)"
                : "rgba(54, 162, 235, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor:
              theme === "dark"
                ? "rgba(75, 192, 192, 1)"
                : "rgba(54, 162, 235, 1)",
          },
        ],
      },
      transport: {
        labels: Object.keys(transportData),
        datasets: [
          {
            label: "Emissions by Transportation Type",
            data: Object.values(transportData),
            backgroundColor: Object.keys(transportData).map(
              (_, i) => backgroundColors[i % backgroundColors.length]
            ),
            borderColor: Object.keys(transportData).map(
              (_, i) => borderColors[i % borderColors.length]
            ),
            borderWidth: 2,
          },
        ],
      },
    };
  };

  const chartData = prepareChartData();

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
        <div className="container-fluid mt-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <h1>Emissions Analytics</h1>
            <Button variant="outline-success" onClick={exportCSV}>
              <FaDownload className="me-2" /> Export Data
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Filters */}
          <Card className={`bg-${theme} m-0 mb-4 z-3 position-relative`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <FaFilter className="me-2" /> Filters
                </h5>
              </div>
              <Row>
                <Col xl={3} lg={4} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xl={3} lg={4} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xl={3} lg={4} md={6}>
                  <EmployeeSelect
                    modalData={{ employees: filters.employees }}
                    employeesState={employees}
                    handleEmployeeChange={handleEmployeeChange}
                    theme={theme}
                  />
                </Col>
                <Col xl={3} lg={4} md={6}>
                  <CarsSelect
                    modalData={{ cars: filters.transportations }}
                    carsState={transportations}
                    handleCarChange={handleTransportationChange}
                    theme={theme}
                  />
                </Col>

                <Col xl={3} lg={4} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Min Emissions (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="minEmissions"
                      value={filters.minEmissions}
                      onChange={(e) =>
                        handleFilterChange("minEmissions", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xl={3} lg={4} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Emissions (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxEmissions"
                      value={filters.maxEmissions}
                      onChange={(e) =>
                        handleFilterChange("maxEmissions", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="d-flex align-items-center mt-2">
                  <Button
                    variant="primary"
                    onClick={applyFilters}
                    className="me-2"
                  >
                    Apply Filters
                  </Button>
                  <Button variant="outline-secondary" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Charts */}
          <Card className={`bg-${theme} m-0 mb-4`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Visualization</h5>
                <ButtonGroup>
                  <Button
                    variant={
                      selectedChart === "line" ? "primary" : "outline-primary"
                    }
                    onClick={() => setSelectedChart("line")}
                  >
                    <FaChartLine className="me-2" /> Line
                  </Button>
                  <Button
                    variant={
                      selectedChart === "bar" ? "primary" : "outline-primary"
                    }
                    onClick={() => setSelectedChart("bar")}
                  >
                    <FaChartBar className="me-2" /> Bar
                  </Button>
                  <Button
                    variant={
                      selectedChart === "pie" ? "primary" : "outline-primary"
                    }
                    onClick={() => setSelectedChart("pie")}
                  >
                    <FaChartPie className="me-2" /> Pie
                  </Button>
                </ButtonGroup>
              </div>
              <Row>
                <Col lg={8}>
                  <div style={{ height: "400px" }}>
                    {selectedChart === "line" && (
                      <Line
                        data={chartData.monthly}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color:
                                  theme === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.1)",
                              },
                              ticks: {
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  size: 11,
                                },
                              },
                              title: {
                                display: true,
                                text: "CO₂ Emissions (kg)",
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  weight: "bold",
                                  size: 12,
                                },
                              },
                            },
                            x: {
                              grid: {
                                color:
                                  theme === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.1)",
                              },
                              ticks: {
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  size: 11,
                                },
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              labels: {
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            tooltip: {
                              backgroundColor:
                                theme === "dark"
                                  ? "rgba(0, 0, 0, 0.8)"
                                  : "rgba(255, 255, 255, 0.8)",
                              titleColor: theme === "dark" ? "#fff" : "#000",
                              bodyColor: theme === "dark" ? "#fff" : "#000",
                              borderColor:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.2)",
                              borderWidth: 1,
                            },
                          },
                        }}
                      />
                    )}
                    {selectedChart === "bar" && (
                      <Bar
                        data={chartData.monthly}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color:
                                  theme === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.1)",
                              },
                              ticks: {
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  size: 11,
                                },
                              },
                              title: {
                                display: true,
                                text: "CO₂ Emissions (kg)",
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  weight: "bold",
                                  size: 12,
                                },
                              },
                            },
                            x: {
                              grid: {
                                color:
                                  theme === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.1)",
                              },
                              ticks: {
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  size: 11,
                                },
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              labels: {
                                color: theme === "dark" ? "#fff" : "#666",
                                font: {
                                  size: 12,
                                },
                              },
                            },
                            tooltip: {
                              backgroundColor:
                                theme === "dark"
                                  ? "rgba(0, 0, 0, 0.8)"
                                  : "rgba(255, 255, 255, 0.8)",
                              titleColor: theme === "dark" ? "#fff" : "#000",
                              bodyColor: theme === "dark" ? "#fff" : "#000",
                              borderColor:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.2)",
                              borderWidth: 1,
                            },
                          },
                        }}
                      />
                    )}
                    {selectedChart === "pie" && (
                      <Pie
                        data={chartData.transport}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                              labels: {
                                color: theme === "dark" ? "#fff" : "#666",
                                padding: 15,
                                font: {
                                  size: 11,
                                },
                              },
                            },
                            tooltip: {
                              backgroundColor:
                                theme === "dark"
                                  ? "rgba(0, 0, 0, 0.8)"
                                  : "rgba(255, 255, 255, 0.8)",
                              titleColor: theme === "dark" ? "#fff" : "#000",
                              bodyColor: theme === "dark" ? "#fff" : "#000",
                              borderColor:
                                theme === "dark"
                                  ? "rgba(255, 255, 255, 0.2)"
                                  : "rgba(0, 0, 0, 0.2)",
                              borderWidth: 1,
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </Col>
                <Col lg={4}>
                  <Card className={`bg-${theme} m-0 h-100`}>
                    <Card.Body>
                      <h6>Summary Statistics</h6>
                      <hr />
                      <div className="mb-2">
                        <strong>Total Records:</strong>{" "}
                        {filteredEmissions.length}
                      </div>
                      <div className="mb-2">
                        <strong>Total CO₂ Emissions:</strong>{" "}
                        {formatDecimal(
                          filteredEmissions.reduce((sum, e) => {
                            // Use co2Used or emissionsKg, whichever is available
                            const value = parseFloat(
                              e.co2Used || e.emissionsKg || 0
                            );
                            return sum + value;
                          }, 0)
                        )}{" "}
                        kg
                      </div>
                      <div className="mb-2">
                        <strong>Average CO₂ per Record:</strong>{" "}
                        {formatDecimal(
                          filteredEmissions.length > 0
                            ? filteredEmissions.reduce((sum, e) => {
                                // Use co2Used or emissionsKg, whichever is available
                                const value = parseFloat(
                                  e.co2Used || e.emissionsKg || 0
                                );
                                return sum + value;
                              }, 0) / filteredEmissions.length
                            : 0
                        )}{" "}
                        kg
                      </div>
                      <div className="mb-2">
                        <strong>Total Distance:</strong>{" "}
                        {formatDecimal(
                          filteredEmissions.reduce((sum, e) => {
                            // Some emission records might not have distance
                            const distance = parseFloat(e.distance || 0);
                            return sum + distance;
                          }, 0)
                        )}{" "}
                        km
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Data Table */}
          <Card className={`bg-${theme} m-0`}>
            <Card.Body>
              <h5 className="mb-3">Detailed Data</h5>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee</th>
                      <th>Transportation</th>
                      <th>Distance (km)</th>
                      <th>CO₂ Used (kg)</th>
                      <th>Start Location</th>
                      <th>End Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmissions.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No emissions data found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmissions.map((emission) => {
                        // Extract employee name - handle different structures
                        let employeeName = "N/A";
                        if (emission.employee) {
                          if (
                            emission.employee.firstName ||
                            emission.employee.lastName
                          ) {
                            employeeName = `${
                              emission.employee.firstName || ""
                            } ${emission.employee.lastName || ""}`.trim();
                          } else if (typeof emission.employee === "string") {
                            employeeName = emission.employee;
                          }
                        }

                        // Extract transportation name - handle different structures
                        let transportationName = "N/A";
                        if (
                          emission.transportation &&
                          emission.transportation.name
                        ) {
                          transportationName = emission.transportation.name;
                        } else if (emission.transportationType) {
                          transportationName = emission.transportationType;
                        }

                        // Extract locations - handle different structures
                        let startLocation = "N/A";
                        let endLocation = "N/A";

                        if (emission.startLocation) {
                          if (emission.startLocation.address) {
                            startLocation = emission.startLocation.address;
                          } else if (
                            typeof emission.startLocation === "string"
                          ) {
                            startLocation = emission.startLocation;
                          }
                        } else if (emission.beginLocation) {
                          startLocation = emission.beginLocation;
                        }

                        if (emission.endLocation) {
                          if (emission.endLocation.address) {
                            endLocation = emission.endLocation.address;
                          } else if (typeof emission.endLocation === "string") {
                            endLocation = emission.endLocation;
                          }
                        }

                        // Extract emissions value
                        const emissionsValue =
                          emission.co2Used || emission.emissionsKg || 0;

                        return (
                          <tr key={emission._id}>
                            <td>
                              {new Date(emission.date).toLocaleDateString()}
                            </td>
                            <td>{employeeName}</td>
                            <td>{transportationName}</td>
                            <td>{formatDecimal(emission.distance || 0)}</td>
                            <td>{formatDecimal(emissionsValue)}</td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {startLocation}
                            </td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {endLocation}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
