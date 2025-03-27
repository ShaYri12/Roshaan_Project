import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaChartLine, FaHome, FaUserPlus } from "react-icons/fa";
import DynamicSelect from "../components/DynamicSelect";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useDebounce } from "use-debounce";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const EmissionPage = () => {
  const [emissionRecords, setEmissionRecords] = useState([]);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emissionRecord, emissionRecordRecord] = useState({
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
  const [positionStart, setPositionStart] = useState([51.505, -0.09]); // Default position for start location
  const [positionEnd, setPositionEnd] = useState([48.8566, 2.3522]); // Default position for end location
  const [markerPositionStart, setMarkerPositionStart] = useState(positionStart); // Start marker
  const [markerPositionEnd, setMarkerPositionEnd] = useState(positionEnd); // End marker
  const [debouncedStartLocation] = useDebounce(
    emissionRecord.startLocation.address,
    1000
  ); // 1-second debounce for start location
  const [debouncedEndLocation] = useDebounce(
    emissionRecord.endLocation.address,
    1000
  ); // 1-second debounce for end location
  const navigate = useNavigate();

  // Fetch all emission records, employees, and cars
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const [emissionsRes, employeesRes, carsRes] = await Promise.all([
          fetch(`${REACT_APP_API_URL}/emissions`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
            },
          }),
          fetch(`${REACT_APP_API_URL}/employees`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
            },
          }),
          fetch(`${REACT_APP_API_URL}/transportations`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
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

  useEffect(() => {
    if (debouncedStartLocation) {
      const fetchCoordinates = async () => {
        const coords = await geocode(debouncedStartLocation);
        if (coords) {
          console.log("Location Coordinates:", coords); // Debugging
          setPositionStart([coords.lat, coords.lon]);
          setMarkerPositionStart([coords.lat, coords.lon]);
          emissionRecordRecord((prev) => ({
            ...prev,
            startLocation: {
              address: coords.address,
              lat: coords.lat,
              lon: coords.lon,
            },
          }));
        } else {
          console.log("Start location not found");
        }
      };
      fetchCoordinates();
    } else {
      // Reset to default position if the search is cleared
      setPositionStart([51.505, -0.09]);
      setMarkerPositionStart([51.505, -0.09]);
    }
  }, [debouncedStartLocation]); // Ensure debouncedStartLocation triggers the effect

  // Custom hook to handle map events (click event for start and end location)
  const MapClickHandler = ({
    setPosition,
    setMarkerPosition,
    setLocation,
    locationType,
  }) => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng; // Get clicked position
        setPosition([lat, lng]); // Update map center
        setMarkerPosition([lat, lng]); // Update marker position
        // Reverse geocode the clicked location to get its name
        const fetchLocationName = async () => {
          const coords = await geocode(`${lat},${lng}`);
          if (coords) {
            const newLocation = {
              address: coords.address, // Set location name in the object
              lat: coords.lat,
              lon: coords.lon,
            };
            setLocation(newLocation, locationType);
          }
        };
        fetchLocationName();
      },
    });

    return null;
  };

  const handleInputChange = (e, field) => {
    emissionRecordRecord({ ...emissionRecord, [field]: e.target.value });
    // If start location is being changed, reset position on the map
    if (field === "startLocation") {
      setPositionStart([51.505, -0.09]); // Default position
      setMarkerPositionStart([51.505, -0.09]); // Reset marker position
    }
  };

  const geocode = async (location) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${location}&format=json&addressdetails=1`
    );
    const data = await response.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        address: data[0].display_name,
      };
    }
    return null;
  };

  const handleLocationChange = (location, locationType) => {
    emissionRecordRecord((prev) => ({
      ...prev,
      [locationType]: location,
    }));
  };

  const handleAdd = () => {
    emissionRecordRecord({
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
    console.log(emissionRecord);
    try {
      const response = await fetch(`${REACT_APP_API_URL}/emissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
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
      console.log(`Failed to submit emission record: ${error.message}`);
    }
  };

  // Edit modal handler
  const handleEdit = (record) => {
    console.log(record);
    emissionRecordRecord({
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
    setPositionStart([record.startLocation.lat, record.startLocation.lon]);
    setMarkerPositionStart([
      record.startLocation.lat,
      record.startLocation.lon,
    ]);
    setPositionEnd([record.endLocation.lat, record.endLocation.lon]);
    setMarkerPositionEnd([record.endLocation.lat, record.endLocation.lon]);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    console.log("New record!", emissionRecord);
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/emissions/${emissionRecord._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
          body: JSON.stringify(emissionRecord),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      console.log(
        "Emission record updated successfully!",
        await response.json()
      );
      window.location.reload();
    } catch (error) {
      console.error("Error submitting updated record:", error);
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
      console.log(deleteRecordId);
      const response = await fetch(
        `${REACT_APP_API_URL}/emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
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
                    <td>{record.distance}</td>
                    <td>{record.co2Used}</td>
                    <td>
                      {record.employee?.firstName} {record.employee?.lastName}
                    </td>
                    <td>{record.transportation?.name || "N/A"}</td>
                    <td>
                      <div className="d-flex">
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleEdit(record)} // This triggers handleEdit for updating
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmDelete(record)} // This triggers confirmDelete
                        >
                          Delete
                        </button>
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
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Emission Record</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddSubmit}>
              <Form.Group controlId="startLocation" className="mb-3">
                <Form.Label>Start Location</Form.Label>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    value={emissionRecord.startLocation.address}
                    onChange={(e) => handleInputChange(e, "startLocation")}
                    placeholder="Enter start location"
                  />
                  <MapContainer
                    center={positionStart}
                    zoom={13}
                    style={{ height: "115px", width: "100%" }}
                    className="mt-2"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={markerPositionStart}>
                      <Popup>{emissionRecord.startLocation.address}</Popup>
                    </Marker>
                    <MapClickHandler
                      setPosition={setPositionStart}
                      setMarkerPosition={setMarkerPositionStart}
                      setLocation={(location) =>
                        handleLocationChange(location, "startLocation")
                      }
                    />
                  </MapContainer>
                </div>
              </Form.Group>

              <Form.Group controlId="endLocation" className="mb-3">
                <Form.Label>End Location</Form.Label>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    value={emissionRecord.endLocation.address}
                    onChange={(e) => handleInputChange(e, "endLocation")}
                    placeholder="Enter end location"
                  />
                  <MapContainer
                    center={positionEnd}
                    zoom={13}
                    style={{ height: "115px", width: "100%" }}
                    className="mt-2"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={markerPositionEnd}>
                      <Popup>{emissionRecord.endLocation.address}</Popup>
                    </Marker>
                    <MapClickHandler
                      setPosition={setPositionEnd}
                      setMarkerPosition={setMarkerPositionEnd}
                      setLocation={(location) =>
                        handleLocationChange(location, "endLocation")
                      }
                    />
                  </MapContainer>
                </div>
              </Form.Group>

              <Form.Group controlId="date" className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emissionRecord.date}
                  onChange={(e) => handleInputChange(e, "date")}
                />
              </Form.Group>

              {/* <Form.Group controlId="distance" className="mb-3">
                <Form.Label>Distance</Form.Label>
                <Form.Control
                  type="number"
                  disabled
                  value={emissionRecord.distance}
                  placeholder="Distance in km"
                />
              </Form.Group> */}

              <Form.Group controlId="co2Used" className="mb-3">
                <Form.Label>CO2 Used</Form.Label>
                <Form.Control
                  type="number"
                  value={emissionRecord.co2Used}
                  onChange={(e) => handleInputChange(e, "co2Used")}
                  placeholder="Enter CO2 used in grams"
                />
              </Form.Group>
              <div>
                <Form.Group controlId="employee" className="mb-3">
                  <DynamicSelect
                    label="Employee"
                    id="employee"
                    className="form-select"
                    modalData={emissionRecord} // or selectedRecord for the edit modal
                    stateData={employeesState} // Array of employee objects
                    handleChange={(selected) =>
                      emissionRecordRecord({
                        ...emissionRecord,
                        employee: selected ? selected.value : "", // Set the selected employee ObjectId
                      })
                    }
                    formatData={(employee) => ({
                      value: employee._id, // Use employee ObjectId for value
                      label: `${employee.firstName} ${employee.lastName}`,
                      key: employee._id,
                    })}
                    isMulti={false} // Single select
                  />
                </Form.Group>

                <Form.Group controlId="transportation" className="mb-3">
                  <DynamicSelect
                    label="Transportation"
                    id="transportation"
                    modalData={emissionRecord} // or selectedRecord for the edit modal
                    stateData={carsState} // Array of car objects
                    handleChange={(selected) =>
                      emissionRecordRecord({
                        ...emissionRecord,
                        transportation: selected ? selected.value : "", // Save selected ID
                      })
                    }
                    formatData={(car) => ({
                      value: car._id, // Store car _id in value field
                      label: `${car.name}`,
                      key: car._id, // Optional key for React list rendering
                    })}
                    isMulti={false} // Single select
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" className="mt-3">
                  Save Record
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={showEditModal}
          onHide={closeEditModal}
          className="custom-scrollbar"
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Record</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpdateSubmit}>
              <Form.Group controlId="startLocation" className="mb-3">
                <Form.Label>Start Location</Form.Label>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    value={emissionRecord.startLocation.address}
                    onChange={(e) => handleInputChange(e, "startLocation")}
                    placeholder="Enter start location"
                  />
                  <MapContainer
                    center={positionStart}
                    zoom={13}
                    style={{ height: "115px", width: "100%" }}
                    className="mt-2"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={markerPositionStart}>
                      <Popup>{emissionRecord.startLocation.address}</Popup>
                    </Marker>
                    <MapClickHandler
                      setPosition={setPositionStart}
                      setMarkerPosition={setMarkerPositionStart}
                      setLocation={(location) =>
                        handleLocationChange(location, "startLocation")
                      }
                    />
                  </MapContainer>
                </div>
              </Form.Group>

              <Form.Group controlId="endLocation" className="mb-3">
                <Form.Label>End Location</Form.Label>
                <div>
                  <input
                    type="text"
                    className="form-control"
                    value={emissionRecord.endLocation.address}
                    onChange={(e) => handleInputChange(e, "endLocation")}
                    placeholder="Enter end location"
                  />
                  <MapContainer
                    center={positionEnd}
                    zoom={13}
                    style={{ height: "115px", width: "100%" }}
                    className="mt-2"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={markerPositionEnd}>
                      <Popup>{emissionRecord.endLocation.address}</Popup>
                    </Marker>
                    <MapClickHandler
                      setPosition={setPositionEnd}
                      setMarkerPosition={setMarkerPositionEnd}
                      setLocation={(location) =>
                        handleLocationChange(location, "endLocation")
                      }
                    />
                  </MapContainer>
                </div>
              </Form.Group>

              <Form.Group controlId="date" className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={emissionRecord.date}
                  onChange={(e) => handleInputChange(e, "date")}
                />
              </Form.Group>

              <Form.Group controlId="distance" className="mb-3">
                <Form.Label>Distance</Form.Label>
                <Form.Control
                  disabled
                  type="number"
                  value={emissionRecord.distance}
                />
              </Form.Group>

              <Form.Group controlId="co2Used" className="mb-3">
                <Form.Label>CO2 Used</Form.Label>
                <Form.Control
                  type="number"
                  value={emissionRecord.co2Used}
                  onChange={(e) => handleInputChange(e, "co2Used")}
                  placeholder="Enter CO2 used in grams"
                />
              </Form.Group>
              <div>
                <Form.Group controlId="employee" className="mb-3">
                  <DynamicSelect
                    label="Employee"
                    id="employee"
                    modalData={emissionRecord} // or selectedRecord for the edit modal
                    stateData={employeesState} // Array of employee objects
                    handleChange={(selected) =>
                      emissionRecordRecord({
                        ...emissionRecord,
                        employee: selected ? selected.value : "", // Set the selected employee ObjectId
                      })
                    }
                    formatData={(employee) => ({
                      value: employee._id, // Use employee ObjectId for value
                      label: `${employee.firstName} ${employee.lastName}`,
                      key: employee._id,
                    })}
                    isMulti={false} // Single select
                  />
                </Form.Group>

                <Form.Group controlId="transportation" className="mb-3">
                  <DynamicSelect
                    label="Transportation"
                    id="transportation"
                    modalData={emissionRecord} // or selectedRecord for the edit modal
                    stateData={carsState} // Array of car objects
                    handleChange={(selected) =>
                      emissionRecordRecord({
                        ...emissionRecord,
                        transportation: selected ? selected.value : "", // Save selected ID
                      })
                    }
                    formatData={(car) => ({
                      value: car._id, // Store car _id in value field
                      label: `${car.name}`,
                      key: car._id, // Optional key for React list rendering
                    })}
                    isMulti={false} // Single select
                  />
                </Form.Group>
              </div>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" className="mt-3">
                  Update
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* // Modal for delete confirmation */}
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
