import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../../../env";

/**
 * Modal component for adding or editing transport emission records
 */
const TransportEmissionsModal = ({
  showModal,
  closeModal,
  currentRecord,
  isEdit,
  handleInputChange,
  onSubmitSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to display errors
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

  // Submit new or updated record
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !currentRecord.month ||
      !currentRecord.year ||
      !currentRecord.transportMode ||
      !currentRecord.distance ||
      !currentRecord.weight ||
      !currentRecord.emissionFactor
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!currentRecord.userId) {
      setError("User information not found. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const url = isEdit
        ? `${REACT_APP_API_URL}/transport-emissions/${currentRecord._id}`
        : `${REACT_APP_API_URL}/transport-emissions`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify(currentRecord),
      });

      // Handle response
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Error: ${response.status} - ${response.statusText}`
        );
      }

      console.log(
        `Transport Records record ${
          isEdit ? "updated" : "added"
        } successfully!`,
        responseData
      );

      // Call success callback with the new/updated record
      onSubmitSuccess(responseData, isEdit);
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} record:`, error);
      setError(
        `Failed to ${isEdit ? "update" : "add"} record: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit" : "Add"} Transport Emission Record
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && renderError()}

          <Form.Group className="mb-3">
            <Form.Label>Month</Form.Label>
            <Form.Control
              as="select"
              value={currentRecord.month || ""}
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
              value={currentRecord.year || ""}
              onChange={(e) => handleInputChange(e, "year")}
              placeholder="Enter Year"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Transport Mode</Form.Label>
            <Form.Control
              as="select"
              value={currentRecord.transportMode || ""}
              onChange={(e) => handleInputChange(e, "transportMode")}
              required
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
              value={currentRecord.distance || ""}
              onChange={(e) => handleInputChange(e, "distance")}
              placeholder="Enter Distance"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Weight (tons)</Form.Label>
            <Form.Control
              type="number"
              value={currentRecord.weight || ""}
              onChange={(e) => handleInputChange(e, "weight")}
              placeholder="Enter Weight"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Emission Factor (kg CO₂/ton-km)</Form.Label>
            <Form.Control
              type="number"
              value={currentRecord.emissionFactor || ""}
              onChange={(e) => handleInputChange(e, "emissionFactor")}
              placeholder="Enter Emission Factor"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="success" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>{isEdit ? "Update" : "Save"}</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TransportEmissionsModal;
