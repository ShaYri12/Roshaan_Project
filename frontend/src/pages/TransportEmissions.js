import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaHome, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";

const TransportEmissions = (tab) => {
  console.log(tab);
  // Safely get and parse user data
  const userObj = localStorage.getItem("userObj");
  let user = null;
  let userId = "";

  try {
    if (userObj) {
      user = JSON.parse(userObj);
      userId = user._id || "";
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transportRecords, setTransportRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({
    userId: userId,
    month: "",
    year: "",
    transportMode: "",
    distance: "",
    weight: "",
    emissionFactor: "",
  });
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleAdd = () => {
    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    setCurrentRecord({
      userId: userId,
      month: "",
      year: "",
      transportMode: "",
      distance: "",
      weight: "",
      emissionFactor: "",
    });
    setShowModal(true);
    setError("");
  };

  useEffect(() => {
    const fetchTransportEmissions = async () => {
      setIsLoading(true);

      // Skip fetch if no userId
      if (!userId) {
        setError("User information not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching transport emissions for user ID:", userId);

        const response = await fetch(
          `${REACT_APP_API_URL}/transport-emissions/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setTransportRecords(data);
        console.log("Transport Emission Records:", data);
      } catch (error) {
        console.error("Error fetching transport emissions:", error);
        setError(`Failed to load transport emissions: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransportEmissions();
  }, [userId]); // Depend on userId

  const handleEdit = (record) => {
    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    setCurrentRecord({
      ...record,
      userId: userId,
    });
    setShowModal(true);
    setIsEdit(true);
    setError("");
  };

  // Confirm delete
  const confirmDelete = (data) => {
    if (!data._id) {
      setError("Cannot delete: Record ID not found.");
      return;
    }

    setDeleteRecordId(data._id);
    setShowDeleteConfirm(true);
    setError("");
  };

  // Delete the emission record
  const handleDelete = async () => {
    if (!deleteRecordId) {
      setError("Cannot delete: Record ID not found.");
      return;
    }

    try {
      console.log("Deleting record ID:", deleteRecordId);
      setIsLoading(true);

      const response = await fetch(
        `${REACT_APP_API_URL}/transport-emissions/${deleteRecordId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to delete record");

      console.log("Transport Emission record deleted successfully!");
      setShowDeleteConfirm(false);

      // Remove the deleted record from state instead of reloading
      setTransportRecords((prev) =>
        prev.filter((record) => record._id !== deleteRecordId)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(`Failed to delete record: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, field) => {
    setCurrentRecord((prev) => ({
      ...prev,
      [field]: e.target.value,
      userId: userId,
    }));
  };

  // Submit new or updated record
  const handleSubmit = async (e, isUpdate = isEdit) => {
    e.preventDefault();

    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    console.log(
      isUpdate ? "Updating record..." : "Adding new record...",
      currentRecord
    );

    try {
      setIsLoading(true);

      const url = isUpdate
        ? `${REACT_APP_API_URL}/transport-emissions/${currentRecord._id}`
        : `${REACT_APP_API_URL}/transport-emissions`;

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify({
          ...currentRecord,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error: ${response.status} - ${response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log(
        `Transport Records record ${
          isUpdate ? "updated" : "added"
        } successfully!`,
        responseData
      );

      // Update state instead of reloading
      if (isUpdate) {
        setTransportRecords((prev) =>
          prev.map((record) =>
            record._id === currentRecord._id ? responseData : record
          )
        );
      } else {
        setTransportRecords((prev) => [...prev, responseData]);
      }

      setShowModal(false);
    } catch (error) {
      console.error(`Error ${isUpdate ? "updating" : "adding"} record:`, error);
      setError(
        `Failed to ${isUpdate ? "update" : "add"} record: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format loading state
  const renderLoading = () => (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Helper to format error state
  const renderError = () => (
    <div className="alert alert-danger" role="alert">
      <strong>Error:</strong> {error}
      <button
        className="btn btn-outline-danger btn-sm float-end"
        onClick={() => setError("")}
      >
        Dismiss
      </button>
    </div>
  );

  return (
    <>
      {/* <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <div className="card-header d-flex align-items-center">
                        <i className="fas fa-bus fa-2x me-3"></i>
                        <h4 className="card-title mb-0">Transport Emission Records</h4>
                    </div>
                    <button className="btn btn-outline-primary" onClick={() => navigate("/dashboard")}>
                        <FaHome className="me-2" /> Home
                    </button>
                </div>
            </nav> */}
      {tab.activeTab === "TransportEmissions" && (
        <div className="container py-5">
          {error && renderError()}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-left text-primary mb-0">
              Monthly Transport Emissions
            </h4>
            <button
              className="btn btn-success"
              onClick={handleAdd}
              disabled={!userId || isLoading}
            >
              <FaPlus className="me-2" /> Add New Record
            </button>
          </div>

          {isLoading ? (
            renderLoading()
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Transport Mode</th>
                    <th>Distance (km)</th>
                    <th>Weight (tons)</th>
                    <th>Emission Factor (kg CO₂/ton-km)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transportRecords.length > 0 ? (
                    transportRecords.map((record, index) => (
                      <tr key={record._id || index}>
                        <td>{index + 1}</td>
                        <td>{record.month}</td>
                        <td>{record.year}</td>
                        <td>{record.transportMode}</td>
                        <td>{record.distance}</td>
                        <td>{record.weight}</td>
                        <td>{record.emissionFactor}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => handleEdit(record)}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => confirmDelete(record)}
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        {userId
                          ? "No records found"
                          : "Please log in to view your records"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentRecord._id ? "Edit" : "Add"} Transport Emission Record
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && renderError()}

            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Control
                as="select"
                value={currentRecord.month}
                onChange={(e) => handleInputChange(e, "month")}
                required
              >
                <option value="">Select Month</option>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                value={currentRecord.year}
                onChange={(e) => handleInputChange(e, "year")}
                placeholder="Enter Year"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Transport Mode</Form.Label>
              <Form.Control
                as="select"
                value={currentRecord.transportMode}
                onChange={(e) => handleInputChange(e, "transportMode")}
              >
                <option value="">Select Mode</option>
                {["Truck", "Train", "Ship", "Airplane"].map((mode, index) => (
                  <option key={index} value={mode}>
                    {mode}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Distance (km)</Form.Label>
              <Form.Control
                type="number"
                value={currentRecord.distance}
                onChange={(e) => handleInputChange(e, "distance")}
                placeholder="Enter Distance"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (tons)</Form.Label>
              <Form.Control
                type="number"
                value={currentRecord.weight}
                onChange={(e) => handleInputChange(e, "weight")}
                placeholder="Enter Weight"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Emission Factor (kg CO₂/ton-km)</Form.Label>
              <Form.Control
                type="number"
                value={currentRecord.emissionFactor}
                onChange={(e) => handleInputChange(e, "emissionFactor")}
                placeholder="Enter Emission Factor"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              {isEdit ? "Update" : "Save"}{" "}
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
          Are you sure you want to delete this Transport Emission record?
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
    </>
  );
};

export default TransportEmissions;
