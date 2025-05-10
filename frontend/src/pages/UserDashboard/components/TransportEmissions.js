import React, { useEffect, useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../../env";
import {
  isYearlyRecordEditable,
  formatDecimal,
} from "../../../utils/dateUtils";
import TransportEmissionsModal from "./modals/TransportEmissionsModal";

/**
 * Transport Emissions component for monthly transport emissions tracking
 * Used as a tab within the UserDashboard
 */
const TransportEmissions = ({ activeTab }) => {
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
    setIsEdit(false);
    setShowModal(true);
    setError("");
  };

  // Move loadTransportEmissions to useCallback to prevent unnecessary rerenders
  const loadTransportEmissions = useCallback(async () => {
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
  }, [userId]);

  // Load data when tab becomes active
  useEffect(() => {
    if (activeTab === "TransportEmissions") {
      loadTransportEmissions();
    }
  }, [activeTab, loadTransportEmissions]);

  const handleEdit = (record) => {
    if (!userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    setCurrentRecord({
      ...record,
      userId: userId,
    });
    setIsEdit(true);
    setShowModal(true);
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

  // Submit new or updated record - now uses the modal's callback
  const handleSubmitSuccess = (newRecord, isUpdating) => {
    // Update the local state immediately for fast UI response
    if (isUpdating) {
      setTransportRecords((prev) =>
        prev.map((record) =>
          record._id === newRecord._id ? newRecord : record
        )
      );
    } else {
      setTransportRecords((prev) => [...prev, newRecord]);
    }

    // Also refresh the data from server to ensure consistency
    loadTransportEmissions();

    // Close the modal
    setShowModal(false);
  };

  // Helper to format loading state
  const renderLoading = () => (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-success" role="status">
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
      {activeTab === "TransportEmissions" && (
        <div className="container py-5">
          {error && renderError()}

          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-left text-success mb-0">
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
                        <td>{formatDecimal(record.distance)}</td>
                        <td>{formatDecimal(record.weight)}</td>
                        <td>{formatDecimal(record.emissionFactor)}</td>
                        <td>
                          {isYearlyRecordEditable(record) ? (
                            <>
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
                            </>
                          ) : (
                            <span className="text-muted small">
                              Locked (previous year)
                            </span>
                          )}
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
      <TransportEmissionsModal
        showModal={showModal}
        closeModal={() => setShowModal(false)}
        currentRecord={currentRecord}
        isEdit={isEdit}
        handleInputChange={handleInputChange}
        onSubmitSuccess={handleSubmitSuccess}
      />

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
