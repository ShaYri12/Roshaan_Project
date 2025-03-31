import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaChartLine, FaHome, FaUserPlus } from "react-icons/fa";
import DynamicSelect from "../components/DynamicSelect";
import LocationPicker from "../components/LocationPicker";
import { isRecordEditable, formatDecimal } from "../utils/dateUtils";

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

  // Fetch all emission records, employees, and cars
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;
        const [emissionsRes, employeesRes, carsRes] = await Promise.all([
          fetch(`${REACT_APP_API_URL}/emissions`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${REACT_APP_API_URL}/employees`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${REACT_APP_API_URL}/transportations`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        if (!emissionsRes.ok || !employeesRes.ok || !carsRes.ok) {
          throw new Error("Failed to fetch data");
        }
        const [emissionsData, employeesData, carsData] = await Promise.all([
          emissionsRes.json(),
          employeesRes.json(),
          carsRes.json(),
        ]);
        setEmissionRecords(emissionsData);
        setEmployeesState(employeesData);
        setCarsState(carsData);
      } catch (error) {
        setError(error.message);
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
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;
      const response = await fetch(`${REACT_APP_API_URL}/emissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emissionRecord),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;
      const response = await fetch(
        `${REACT_APP_API_URL}/emissions/${emissionRecord._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(emissionRecord),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

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
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;
      const response = await fetch(
        `${REACT_APP_API_URL}/emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      console.log("Emission record deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete emission record: ${error.message}`);
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-chart-line fa-2x me-3"></i>
            <h4 className="card-title mb-0">Emission Records</h4>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/energy-emissions")}
          >
            <FaChartLine className="me-2" /> Energy & Gas Emission
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome className="me-2" /> Home
          </button>
        </div>
      </nav>

      <div className="container py-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <p className="mb-0">Total Records: {emissionRecords.length}</p>
          <button className="btn btn-success" onClick={handleAdd}>
            <FaUserPlus className="me-2" /> Add New Record
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
                    <td>
                      <div className="d-flex">
                        {isRecordEditable(record) ? (
                          <>
                            <button
                              className="btn btn-info btn-sm me-2"
                              onClick={() => handleEdit(record)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => confirmDelete(record)}
                            >
                              Delete
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
  );
};

export default EmissionPage;
