import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Card, Row, Col } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import DynamicSelect from "../components/DynamicSelect";
import LocationPicker from "../components/LocationPicker";
import { isRecordEditable, formatDecimal } from "../utils/dateUtils";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";
import { Line, Bar, Pie } from "react-chartjs-2";
import EmployeeSelect from "../components/EmployeeSelect";
import CarsSelect from "../components/CarsSelect";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EmissionPage = () => {
  const [emissionRecords, setEmissionRecords] = useState([]);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emissionRecord, setEmissionRecord] = useState({
    startLocation: { address: "", lat: 0, lon: 0 },
    endLocation: { address: "", lat: 0, lon: 0 },
    date: "",
    distance: "",
    co2Used: "",
    employee: "",
    transportation: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [employeesState, setEmployeesState] = useState([]);
  const [carsState, setCarsState] = useState([]);
  const navigate = useNavigate();

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // New state variables for analytics
  const [emissionsByMonth, setEmissionsByMonth] = useState({});
  const [emissionsByType, setEmissionsByType] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Add filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employees: [],
    transportations: [],
  });

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found in Emissions page, redirecting to login");
          navigate("/");
          return;
        }

        try {
          // Validate token
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (!response.ok) {
            // Failed validation, redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          } else {
            // Set the user data
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
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  // Fetch all emission records, employees, and cars
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        console.log("Fetching emissions data...");
        // Store JWT_ADMIN_SECRET in localStorage for axiosConfig to use
        localStorage.setItem("JWT_ADMIN_SECRET", JWT_ADMIN_SECRET);

        // Use Promise.all with authenticatedFetch instead
        const [emissionsRes, employeesRes, carsRes] = await Promise.all([
          authenticatedFetch(`${REACT_APP_API_URL}/emissions?global=true`, {
            method: "GET",
            headers: {
              // Include JWT_ADMIN_SECRET as a fallback
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/employees`, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
          authenticatedFetch(`${REACT_APP_API_URL}/transportations`, {
            method: "GET",
            headers: {
              ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
                ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
                : {}),
            },
          }),
        ]);

        console.log("Emissions API response status:", emissionsRes.status);
        console.log("Employees API response status:", employeesRes.status);
        console.log("Transportations API response status:", carsRes.status);

        const [emissionsData, employeesData, carsData] = await Promise.all([
          emissionsRes.json(),
          employeesRes.json(),
          carsRes.json(),
        ]);

        console.log("Emissions data length:", emissionsData.length);
        console.log("Employees data length:", employeesData.length);
        console.log("Cars data length:", carsData.length);

        setEmissionRecords(emissionsData);
        setEmployeesState(employeesData);
        setCarsState(carsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data: ${error.message}`);
      }
    };
    fetchEmissions();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (startLat, startLon, endLat, endLon) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((endLat - startLat) * Math.PI) / 180;
    const dLon = ((endLon - startLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((startLat * Math.PI) / 180) *
        Math.cos((endLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2);
  };

  // Update distance whenever start or end location changes
  useEffect(() => {
    if (
      emissionRecord.startLocation?.lat &&
      emissionRecord.startLocation?.lon &&
      emissionRecord.endLocation?.lat &&
      emissionRecord.endLocation?.lon
    ) {
      const distance = calculateDistance(
        emissionRecord.startLocation.lat,
        emissionRecord.startLocation.lon,
        emissionRecord.endLocation.lat,
        emissionRecord.endLocation.lon
      );

      setEmissionRecord((prev) => ({
        ...prev,
        distance,
      }));
    }
  }, [emissionRecord.startLocation, emissionRecord.endLocation]);

  const handleInputChange = (e, field) => {
    setEmissionRecord({
      ...emissionRecord,
      [field]: e.target.value,
    });
  };

  const handleStartLocationChange = (location) => {
    setEmissionRecord((prev) => ({
      ...prev,
      startLocation: location,
    }));
  };

  const handleEndLocationChange = (location) => {
    setEmissionRecord((prev) => ({
      ...prev,
      endLocation: location,
    }));
  };

  const handleAdd = () => {
    setEmissionRecord({
      startLocation: { address: "", lat: 0, lon: 0 },
      endLocation: { address: "", lat: 0, lon: 0 },
      date: "",
      distance: "",
      co2Used: "",
      employee: "",
      transportation: "",
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const closeEditModal = () => setShowEditModal(false);

  // Submit form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await authenticatedFetch(`${REACT_APP_API_URL}/emissions`, {
        method: "POST",
        body: JSON.stringify(emissionRecord),
        headers: {
          ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
            ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
            : {}),
        },
      });

      console.log("Emission record created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting record:", error);
      setError(`Failed to submit emission record: ${error.message}`);
    }
  };

  // Edit modal handler
  const handleEdit = (record) => {
    setEmissionRecord({
      startLocation: {
        address: record.startLocation.address,
        lat: record.startLocation.lat,
        lon: record.startLocation.lon,
      },
      endLocation: {
        address: record.endLocation.address,
        lat: record.endLocation.lat,
        lon: record.endLocation.lon,
      },
      date: new Date(record?.date).toISOString().split("T")[0],
      distance: record.distance,
      co2Used: record.co2Used,
      employee: record.employee?._id,
      transportation: record.transportation?._id,
      _id: record?._id,
    });
    setShowEditModal(true);
  };

  // Update record
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/emissions/${emissionRecord._id}`,
        {
          method: "PUT",
          body: JSON.stringify(emissionRecord),
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        }
      );

      console.log("Emission record updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error submitting updated record:", error);
      setError(`Failed to update emission record: ${error.message}`);
    }
  };

  // Confirm delete
  const confirmDelete = (data) => {
    setDeleteRecordId(data?._id);
    setShowDeleteConfirm(true);
  };

  // Delete the emission record
  const handleDelete = async () => {
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            ...(JWT_ADMIN_SECRET && !localStorage.getItem("token")
              ? { Authorization: `Bearer ${JWT_ADMIN_SECRET}` }
              : {}),
          },
        }
      );

      console.log("Emission record deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete emission record: ${error.message}`);
    }
  };

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

  // Process emissions data for charts
  useEffect(() => {
    if (emissionRecords.length > 0) {
      // Process monthly data
      const monthlyData = emissionRecords.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleString("default", {
          month: "long",
        });
        acc[month] = (acc[month] || 0) + parseFloat(record.co2Used);
        return acc;
      }, {});

      // Process type data
      const typeData = emissionRecords.reduce((acc, record) => {
        const type = record.transportation?.name || "Other";
        acc[type] = (acc[type] || 0) + parseFloat(record.co2Used);
        return acc;
      }, {});

      // Calculate total emissions
      const total = emissionRecords.reduce(
        (sum, record) => sum + parseFloat(record.co2Used),
        0
      );

      setEmissionsByMonth(monthlyData);
      setEmissionsByType(typeData);
      setTotalEmissions(total);
    }
  }, [emissionRecords]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...emissionRecords];
    console.log("Manual filter application triggered");
    console.log("Initial records count:", filtered.length);

    if (filters.startDate) {
      filtered = filtered.filter(
        (record) => new Date(record.date) >= new Date(filters.startDate)
      );
      console.log("After startDate filter:", filtered.length);
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (record) => new Date(record.date) <= new Date(filters.endDate)
      );
      console.log("After endDate filter:", filtered.length);
    }

    if (filters.employees && filters.employees.length > 0) {
      console.log("Selected employees:", filters.employees);
      filtered = filtered.filter((record) =>
        filters.employees.some((emp) => emp.value === record.employee?._id)
      );
      console.log("After employees filter:", filtered.length);
    }

    if (filters.transportations && filters.transportations.length > 0) {
      console.log("Selected transportations:", filters.transportations);
      filtered = filtered.filter((record) =>
        filters.transportations.some(
          (trans) => trans.value === record.transportation?._id
        )
      );
      console.log("After transportations filter:", filtered.length);
    }

    setFilteredRecords(filtered);
    console.log("Final filtered records:", filtered.length);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      employees: [],
      transportations: [],
    });
    setFilteredRecords(emissionRecords);
  };

  // Initialize filtered records when emission records change
  useEffect(() => {
    setFilteredRecords(emissionRecords);
  }, [emissionRecords]);

  // Chart configurations
  const monthlyChartData = {
    labels: Object.keys(emissionsByMonth),
    datasets: [
      {
        label: "Monthly CO₂ Emissions (kg)",
        data: Object.values(emissionsByMonth),
        backgroundColor:
          theme === "dark"
            ? "rgba(75, 192, 192, 0.3)"
            : "rgba(75, 192, 192, 0.2)",
        borderColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor:
          theme === "dark" ? "rgba(75, 192, 192, 1)" : "rgba(54, 162, 235, 1)",
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(emissionsByType),
    datasets: [
      {
        label: "Emissions by Type",
        data: Object.values(emissionsByType),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
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
            <h1>Emission Records</h1>
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter me-2"></i>{" "}
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="outline-success" onClick={handleAdd}>
                <FaPlusCircle className="me-2" /> Add New Record
              </Button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Filters Section */}
          {showFilters && (
            <Card className={`bg-${theme} mb-4 m-0 z-3 position-relative`}>
              <Card.Body>
                <Card.Title className="mb-3">Filter Records</Card.Title>
                <Row>
                  <Col xl={3} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xl={3} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xl={3} md={6}>
                    <EmployeeSelect
                      modalData={{ employees: filters.employees }}
                      employeesState={employeesState}
                      handleEmployeeChange={(selectedOptions) => {
                        console.log(
                          "Emissions: Employee selection changed to:",
                          selectedOptions
                        );
                        setFilters({
                          ...filters,
                          employees: selectedOptions,
                        });
                      }}
                      theme={theme}
                    />
                  </Col>
                  <Col xl={3} md={6}>
                    <CarsSelect
                      modalData={{ cars: filters.transportations }}
                      carsState={carsState}
                      handleCarChange={(selectedOptions) => {
                        console.log(
                          "Emissions: Transportation selection changed to:",
                          selectedOptions
                        );
                        setFilters({
                          ...filters,
                          transportations: selectedOptions,
                        });
                      }}
                      theme={theme}
                    />
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => {
                      setFilters({
                        startDate: "",
                        endDate: "",
                        employees: [],
                        transportations: [],
                      });
                      setFilteredRecords(emissionRecords);
                    }}
                  >
                    Reset
                  </Button>
                  <Button variant="primary" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Analytics Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-primary">
                    <i className="fas fa-cloud fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Total CO₂ Emissions
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    {formatDecimal(totalEmissions)} kg
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-success">
                    <i className="fas fa-list fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Total Records
                  </Card.Title>
                  <h3 className="text-center mb-0">{filteredRecords.length}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-warning">
                    <i className="fas fa-calculator fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Average per Record
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    {filteredRecords.length > 0
                      ? formatDecimal(totalEmissions / filteredRecords.length)
                      : 0}{" "}
                    kg
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-3 mb-lg-0">
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body className="d-flex flex-column align-items-center">
                  <div className="icon-container mb-3 text-info">
                    <i className="fas fa-road fa-3x"></i>
                  </div>
                  <Card.Title className="text-center mb-3">
                    Total Distance
                  </Card.Title>
                  <h3 className="text-center mb-0">
                    {formatDecimal(
                      filteredRecords.reduce(
                        (sum, record) => sum + parseFloat(record.distance || 0),
                        0
                      )
                    )}{" "}
                    km
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row className="mb-4">
            <Col md={8}>
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">
                    Monthly Emissions Trend
                  </Card.Title>
                  <div style={{ height: "300px", padding: "10px" }}>
                    <Line
                      data={monthlyChartData}
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
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">Emissions by Type</Card.Title>
                  <div style={{ height: "300px", padding: "10px" }}>
                    <Pie
                      data={typeChartData}
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
                            display: Object.keys(emissionsByType).length <= 8,
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
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Records Table */}
          <Card className={`bg-${theme} shadow-sm m-0`}>
            <Card.Body>
              <Card.Title className="mb-3">Emission Records</Card.Title>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Start Location</th>
                      <th>End Location</th>
                      <th>Date</th>
                      <th>Distance (km)</th>
                      <th>CO₂ Used (kg)</th>
                      <th>Employee</th>
                      <th>Transportation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, index) => (
                        <tr key={record._id}>
                          <td>{index + 1}</td>
                          <td className="f10">
                            <div className="scrollable-address">
                              {record.startLocation.address}
                            </div>
                          </td>
                          <td className="f10">
                            <div className="scrollable-address">
                              {record.endLocation.address}
                            </div>
                          </td>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{formatDecimal(record.distance)}</td>
                          <td>{record.co2Used}</td>
                          <td>
                            {record.employee?.firstName}{" "}
                            {record.employee?.lastName}
                          </td>
                          <td>{record.transportation?.name || "N/A"}</td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              {isRecordEditable(record) ? (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEdit(record)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => confirmDelete(record)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted small">
                                  Locked (previous year)
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center text-muted">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>

          {/* Add Modal */}
          <Modal
            show={showAddModal}
            onHide={closeAddModal}
            className="custom-scrollbar"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Emission Record</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddSubmit}>
                <Form.Group controlId="startLocation" className="mb-4">
                  <LocationPicker
                    label="Start Location"
                    value={emissionRecord.startLocation}
                    onChange={handleStartLocationChange}
                    required
                    mapHeight="200px"
                    placeholder="Enter or select start location"
                  />
                </Form.Group>

                <Form.Group controlId="endLocation" className="mb-4">
                  <LocationPicker
                    label="End Location"
                    value={emissionRecord.endLocation}
                    onChange={handleEndLocationChange}
                    required
                    mapHeight="200px"
                    placeholder="Enter or select end location"
                  />
                </Form.Group>

                <div className="row">
                  <div className="col-md-4">
                    <Form.Group controlId="date" className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={emissionRecord.date}
                        onChange={(e) => handleInputChange(e, "date")}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group controlId="distance" className="mb-3">
                      <Form.Label>Distance (km)</Form.Label>
                      <Form.Control
                        type="number"
                        disabled
                        value={emissionRecord.distance}
                        placeholder="Calculated automatically"
                      />
                      <small className="text-muted">
                        Calculated automatically from locations
                      </small>
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group controlId="co2Used" className="mb-3">
                      <Form.Label>CO2 Used (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        value={emissionRecord.co2Used}
                        onChange={(e) => handleInputChange(e, "co2Used")}
                        placeholder="Enter CO2 used"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="employee" className="mb-3">
                      <DynamicSelect
                        label="Employee"
                        id="employee"
                        className="form-select"
                        modalData={emissionRecord}
                        stateData={employeesState}
                        handleChange={(selected) =>
                          setEmissionRecord({
                            ...emissionRecord,
                            employee: selected ? selected.value : "",
                          })
                        }
                        formatData={(employee) => ({
                          value: employee._id,
                          label: `${employee.firstName} ${employee.lastName}`,
                          key: employee._id,
                        })}
                        isMulti={false}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="transportation" className="mb-3">
                      <DynamicSelect
                        label="Transportation"
                        id="transportation"
                        modalData={emissionRecord}
                        stateData={carsState}
                        handleChange={(selected) =>
                          setEmissionRecord({
                            ...emissionRecord,
                            transportation: selected ? selected.value : "",
                          })
                        }
                        formatData={(car) => ({
                          value: car._id,
                          label: `${car.name}`,
                          key: car._id,
                        })}
                        isMulti={false}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Record
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Edit Modal */}
          <Modal
            show={showEditModal}
            onHide={closeEditModal}
            className="custom-scrollbar"
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Update Record</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdateSubmit}>
                <Form.Group controlId="startLocation" className="mb-4">
                  <LocationPicker
                    label="Start Location"
                    value={emissionRecord.startLocation}
                    onChange={handleStartLocationChange}
                    required
                    mapHeight="200px"
                    placeholder="Enter or select start location"
                  />
                </Form.Group>

                <Form.Group controlId="endLocation" className="mb-4">
                  <LocationPicker
                    label="End Location"
                    value={emissionRecord.endLocation}
                    onChange={handleEndLocationChange}
                    required
                    mapHeight="200px"
                    placeholder="Enter or select end location"
                  />
                </Form.Group>

                <div className="row">
                  <div className="col-md-4">
                    <Form.Group controlId="date" className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={emissionRecord.date}
                        onChange={(e) => handleInputChange(e, "date")}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group controlId="distance" className="mb-3">
                      <Form.Label>Distance (km)</Form.Label>
                      <Form.Control
                        type="number"
                        disabled
                        value={emissionRecord.distance}
                        placeholder="Calculated automatically"
                      />
                      <small className="text-muted">
                        Calculated automatically from locations
                      </small>
                    </Form.Group>
                  </div>

                  <div className="col-md-4">
                    <Form.Group controlId="co2Used" className="mb-3">
                      <Form.Label>CO2 Used (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        value={emissionRecord.co2Used}
                        onChange={(e) => handleInputChange(e, "co2Used")}
                        placeholder="Enter CO2 used"
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="employee" className="mb-3">
                      <DynamicSelect
                        label="Employee"
                        id="employee"
                        modalData={emissionRecord}
                        stateData={employeesState}
                        handleChange={(selected) =>
                          setEmissionRecord({
                            ...emissionRecord,
                            employee: selected ? selected.value : "",
                          })
                        }
                        formatData={(employee) => ({
                          value: employee._id,
                          label: `${employee.firstName} ${employee.lastName}`,
                          key: employee._id,
                        })}
                        isMulti={false}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <Form.Group controlId="transportation" className="mb-3">
                      <DynamicSelect
                        label="Transportation"
                        id="transportation"
                        modalData={emissionRecord}
                        stateData={carsState}
                        handleChange={(selected) =>
                          setEmissionRecord({
                            ...emissionRecord,
                            transportation: selected ? selected.value : "",
                          })
                        }
                        formatData={(car) => ({
                          value: car._id,
                          label: `${car.name}`,
                          key: car._id,
                        })}
                        isMulti={false}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Update Record
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            show={showDeleteConfirm}
            onHide={() => setShowDeleteConfirm(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this emission record?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default EmissionPage;
