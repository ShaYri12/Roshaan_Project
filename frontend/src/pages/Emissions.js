import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import DynamicSelect from "../components/DynamicSelect";
import LocationPicker from "../components/LocationPicker";
import { isRecordEditable, formatDecimal } from "../utils/dateUtils";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

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
        <div className="container mt-4">
          <h1 className="mb-4">Emission Records</h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <p className="mb-0">Total Records: {emissionRecords.length}</p>
            <button className="btn btn-outline-success" onClick={handleAdd}>
              <FaPlusCircle className="me-2" /> Add New Record
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Start Location</th>
                  <th>End Location</th>
                  <th>Date</th>
                  <th>Distance (km)</th>
                  <th>CO2 Used (kg)</th>
                  <th>Employee</th>
                  <th>Transportation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emissionRecords.length > 0 ? (
                  emissionRecords.map((record, index) => (
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
                        {record.employee?.firstName} {record.employee?.lastName}
                      </td>
                      <td>{record.transportation?.name || "N/A"}</td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                          {isRecordEditable(record) ? (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleEdit(record)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => confirmDelete(record)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
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
