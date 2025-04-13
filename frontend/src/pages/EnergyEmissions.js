import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaPlusCircle } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import { isRecordEditable, formatDecimal } from "../utils/dateUtils"; // Import the utility function and formatDecimal function
import Sidebar from "../components/Sidebar";
import { authenticatedFetch } from "../utils/axiosConfig";

const EnergyEmissions = () => {
  const navigate = useNavigate();

  // Create a more reliable way to get the user ID
  const [user, setUser] = useState(null);

  // Add Sidebar state variables
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check authentication on load and set user data
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
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (response.ok) {
            // Set the user data
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
            setUser(userObj);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    checkAuth();
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  const [energyRecords, setEnergyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [emissionRecord, setEmissionRecord] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    energySources: [{ type: "", emission: "" }],
  });

  // Update emission record whenever user changes
  useEffect(() => {
    if (user && user._id) {
      setEmissionRecord((prev) => ({
        ...prev,
        userId: user._id,
      }));
    }
  }, [user]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchEnergyEmissions = async () => {
      setLoading(true);
      try {
        console.log("Fetching energy emissions...");
        console.log("API URL:", `${REACT_APP_API_URL}/energy-emissions`);

        const response = await fetch(`${REACT_APP_API_URL}/energy-emissions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (!response.ok) {
          console.error(
            "Error response:",
            response.status,
            response.statusText
          );
          throw new Error(
            `Failed to fetch energy emissions: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Raw energy emission data:", data);

        // Safely parse energySources
        const parsedData = data.map((record) => {
          try {
            return {
              ...record,
              energySources: Array.isArray(record.energySources)
                ? record.energySources.map((source) => {
                    if (typeof source === "string") {
                      try {
                        return JSON.parse(source);
                      } catch (error) {
                        console.warn(
                          "Error parsing energy source:",
                          source,
                          error
                        );
                        return { type: "Unknown", emission: 0 };
                      }
                    }
                    return source;
                  })
                : [],
            };
          } catch (error) {
            console.error("Error processing record:", record, error);
            return record; // Return original record if processing fails
          }
        });

        console.log("Processed energy emission records:", parsedData);
        setEnergyRecords(parsedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching energy emissions:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyEmissions();
  }, []); // Runs only on component mount

  // Add a new energy source
  const addEnergySource = () => {
    setEmissionRecord((prev) => ({
      ...prev,
      energySources: [...prev.energySources, { type: "", emission: "" }],
    }));
  };

  // Remove an energy source
  const removeEnergySource = (index) => {
    setEmissionRecord((prev) => ({
      ...prev,
      energySources: prev.energySources.filter((_, i) => i !== index),
    }));
  };

  const handleAdd = () => {
    if (!user || !user._id) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    setEmissionRecord({
      userId: user._id,
      startDate: "",
      endDate: "",
      energySources: [{ type: "", emission: "" }],
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);
  const closeEditModal = () => setShowEditModal(false);

  // Edit modal handler
  const handleEdit = (record) => {
    console.log("Editing record:", record);

    if (!user || !user._id) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    setEmissionRecord({
      userId: user._id,
      startDate: record.startDate
        ? new Date(record.startDate).toISOString().split("T")[0]
        : "",
      endDate: record.endDate
        ? new Date(record.endDate).toISOString().split("T")[0]
        : "",
      energySources: Array.isArray(record.energySources)
        ? record.energySources.map((source) => ({
            type: source.type || "",
            emission: source.emission || 0,
          }))
        : [{ type: "", emission: "" }],
      _id: record._id,
    });

    setShowEditModal(true);
  };

  // Submit new or updated record
  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    console.log(
      isUpdate ? "Updating record..." : "Adding new record...",
      emissionRecord
    );

    try {
      if (!user || !user._id) {
        throw new Error(
          "User ID is missing or invalid. Please refresh and try again."
        );
      }

      // Include the user ID in the payload
      const formattedEmissionRecord = {
        ...emissionRecord,
        userId: user._id,
        energySources: emissionRecord.energySources.map((source) =>
          JSON.stringify(source)
        ), // Convert each object to a string
      };

      console.log("Submission payload:", formattedEmissionRecord);

      const url = isUpdate
        ? `${REACT_APP_API_URL}/energy-emissions/${emissionRecord._id}`
        : `${REACT_APP_API_URL}/energy-emissions`;

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify(formattedEmissionRecord),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server response: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        `Energy Emission record ${
          isUpdate ? "updated" : "added"
        } successfully!`,
        result
      );
      window.location.reload();
    } catch (error) {
      console.error(`Error ${isUpdate ? "updating" : "adding"} record:`, error);
      setError(error.message);
      alert(
        `Failed to ${isUpdate ? "update" : "add"} record: ${error.message}`
      );
    }
  };

  // Handle general input changes
  const handleInputChange = (e, field) => {
    setEmissionRecord((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handle energy source input changes
  const handleEnergySourceChange = (e, index, field) => {
    setEmissionRecord((prev) => {
      const updatedSources = [...prev.energySources];
      updatedSources[index][field] = e.target.value;
      return { ...prev, energySources: updatedSources };
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return ""; // Handle empty or undefined values
    return new Date(isoString).toISOString().split("T")[0];
  };

  const formatDateForListing = (isoString) => {
    if (!isoString) return ""; // Handle empty or undefined values

    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Confirm delete
  const confirmDelete = (data) => {
    setDeleteRecordId(data._id);
    setShowDeleteConfirm(true);
  };

  // Delete the emission record
  const handleDelete = async () => {
    try {
      console.log("Deleting record ID:", deleteRecordId);
      const response = await fetch(
        `${REACT_APP_API_URL}/energy-emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      console.log("Energy Emission record deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  // Add handleLogout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // Add toggleTheme function
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
          <h1 className="mb-4">Energy & Gas Emissions</h1>
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <p className="mb-0">Total Records: {energyRecords.length}</p>
            <button className="btn btn-outline-success" onClick={handleAdd}>
              <FaPlusCircle className="me-2" /> Add New Record
            </button>
          </div>

          {loading && (
            <div className="alert alert-info">
              Loading energy emission records...
            </div>
          )}
          {error && (
            <div className="alert alert-danger">
              Error: {error}. Please check console for details.
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Energy Sources</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {energyRecords.length > 0 ? (
                  energyRecords.map((record, index) => (
                    <tr key={record._id}>
                      <td>{index + 1}</td>
                      <td>{formatDateForListing(record.startDate)}</td>
                      <td>{formatDateForListing(record.endDate)}</td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {record.energySources &&
                            Array.isArray(record.energySources) &&
                            record.energySources.map((source, idx) => (
                              <li key={idx}>
                                {source.type}: {formatDecimal(source.emission)}{" "}
                                kg CO₂
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                          {isRecordEditable(record, "startDate") ? (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary"
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
                ) : !loading ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No energy emission records found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Modal Form */}
          <Modal
            className="custom-scrollbar"
            show={showAddModal}
            onHide={closeAddModal}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Energy Emission Record</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {/* Month Selection */}
                {/* <Form.Group className="mb-3">
                                <Form.Label>Month</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={emissionRecord.month}
                                    onChange={(e) => handleInputChange(e, "month")}
                                >
                                    <option value="">Select Month</option>
                                    {[...Array(12).keys()].map((m) => (
                                        <option key={m + 1} value={m + 1}>
                                            {new Date(0, m).toLocaleString("default", { month: "long" })}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group> */}

                {/* Year Selection */}
                {/* <Form.Group className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter Year (e.g., 2024)"
                                    value={emissionRecord.year}
                                    onChange={(e) => handleInputChange(e, "year")}
                                />
                            </Form.Group> */}
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={emissionRecord.startDate}
                    onChange={(e) => handleInputChange(e, "startDate")}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={emissionRecord.endDate}
                    onChange={(e) => handleInputChange(e, "endDate")}
                  />
                </Form.Group>

                {/* Energy Sources Section */}
                <Form.Group>
                  <Form.Label>Energy Sources</Form.Label>
                  {emissionRecord.energySources.map((source, index) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control
                        type="text"
                        placeholder="Energy Type (e.g., Electricity, Gas)"
                        value={source.type}
                        onChange={(e) =>
                          handleEnergySourceChange(e, index, "type")
                        }
                        className="me-2"
                      />
                      <Form.Control
                        type="number"
                        placeholder="CO₂ Emission (kg)"
                        value={source.emission}
                        onChange={(e) =>
                          handleEnergySourceChange(e, index, "emission")
                        }
                        className="me-2"
                      />
                      {index > 0 && (
                        <Button
                          variant="danger"
                          onClick={() => removeEnergySource(index)}
                        >
                          X
                        </Button>
                      )}
                    </div>
                  ))}
                </Form.Group>

                {/* Add More Energy Sources */}
                <Button
                  variant="primary"
                  className="mt-2"
                  onClick={addEnergySource}
                >
                  + Add Another Energy Source
                </Button>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeAddModal}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleSubmit}>
                Save Record
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Edit form */}
          <Modal
            className="custom-scrollbar"
            show={showEditModal}
            onHide={closeEditModal}
          >
            <Modal.Header closeButton>
              <Modal.Title>Update Energy Emission Record</Modal.Title>
            </Modal.Header>
            <Form onSubmit={(e) => handleSubmit(e, true)}>
              <Modal.Body>
                {/* Month */}
                {/* <Form.Group controlId="month" className="mb-3">
                                <Form.Label>Month</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={emissionRecord.month}
                                    onChange={(e) => handleInputChange(e, "month")}
                                >
                                    {[
                                        "January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"
                                    ].map((month, index) => (
                                        <option key={index} value={index + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group> */}

                {/* Year */}
                {/* <Form.Group controlId="year" className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={emissionRecord.year}
                                    onChange={(e) => handleInputChange(e, "year")}
                                    placeholder="Enter year"
                                />
                            </Form.Group> */}

                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formatDate(emissionRecord.startDate)}
                    onChange={(e) => handleInputChange(e, "startDate")}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formatDate(emissionRecord.endDate)}
                    onChange={(e) => handleInputChange(e, "endDate")}
                  />
                </Form.Group>
                {/* Energy Sources (Dynamic) */}
                <Form.Group controlId="energySources" className="mb-3">
                  <Form.Label>Energy Sources</Form.Label>
                  {emissionRecord.energySources.map((source, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                      <Form.Control
                        type="text"
                        className="me-2"
                        value={source.type}
                        onChange={(e) =>
                          handleEnergySourceChange(e, index, "type")
                        }
                        placeholder="Energy Type (e.g., Electricity, Gas)"
                      />
                      <Form.Control
                        type="number"
                        value={source.emission}
                        onChange={(e) =>
                          handleEnergySourceChange(e, index, "emission")
                        }
                        placeholder="Emission (kg CO2)"
                      />
                      <Button
                        variant="danger"
                        className="ms-2"
                        onClick={() => removeEnergySource(index)}
                      >
                        ✖
                      </Button>
                    </div>
                  ))}
                  {/* Add More Energy Sources */}
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={addEnergySource}
                  >
                    + Add Another Energy Source
                  </Button>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={closeEditModal}
                >
                  Cancel
                </Button>
                <Button variant="success" type="submit" className="mt-3">
                  Update
                </Button>
              </Modal.Footer>
            </Form>
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
              Are you sure you want to delete this energy emission record?
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

export default EnergyEmissions;
