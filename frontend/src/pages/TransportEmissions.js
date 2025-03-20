import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaHome, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";

const TransportEmissions = (tab) => {
  console.log(tab);
  const user = JSON.parse(localStorage.getItem("userObj"));
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transportRecords, setTransportRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({
    userId: `${user._id}`,
    month: "",
    year: "",
    transportMode: "",
    distance: "",
    weight: "",
    emissionFactor: "",
  });
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  const handleAdd = () => {
    setCurrentRecord({
      month: "",
      year: "",
      transportMode: "",
      distance: "",
      weight: "",
      emissionFactor: "",
    });
    setShowModal(true);
  };

  useEffect(() => {
    const fetchTransportEmissions = async () => {
      try {
        const response = await fetch(
          `${REACT_APP_API_URL}/transport-emissions/${user._id}`,
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

        // Ensure energySources is an array of objects, not strings
        // const parsedData = data.map((record) => ({
        //     ...record,
        //     energySources: record.energySources.map((source) =>
        //         typeof source === "string" ? JSON.parse(source) : source
        //     ),
        // }));

        setTransportRecords(data); // Set energy emissions in state
        console.log("Energy Emission Records:", data);
      } catch (error) {
        console.error("Error fetching energy emissions:", error);
        // setError(error.message);
      }
    };

    fetchTransportEmissions();
  }, []); // Runs only on component mount

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setShowModal(true);
    setIsEdit(true);
  };

  // const handleDelete = () => {
  //     setTransportRecords(transportRecords.filter(r => r !== currentRecord));
  //     setShowDeleteConfirm(false);
  // };

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
      if (!response.ok) throw new Error(result.message);

      console.log("Energy Emission record deleted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleInputChange = (e, field) => {
    setCurrentRecord((prev) => ({
      ...prev,
      [field]: e.target.value,
      userId: `${user._id}`,
    }));
  };

  // Submit new or updated record
  const handleSubmit = async (e, isUpdate = isEdit) => {
    e.preventDefault();
    console.log(
      isUpdate ? "Updating record..." : "Adding new record...",
      currentRecord
    );

    try {
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
        body: JSON.stringify(currentRecord),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      console.log(
        `Transport Records record ${
          isUpdate ? "updated" : "added"
        } successfully!`,
        await response.json()
      );
      window.location.reload();
    } catch (error) {
      console.error(`Error ${isUpdate ? "updating" : "adding"} record:`, error);
    }
  };

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
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-left text-primary mb-0">
              Monthly Transport Emissions
            </h4>
            <button className="btn btn-success" onClick={handleAdd}>
              <FaPlus className="me-2" /> Add New Record
            </button>
          </div>

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
                    <tr key={index}>
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
                        >
                          Edit
                        </button>
                        {/* <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(record)}>Delete</button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Control
                as="select"
                value={currentRecord.month}
                onChange={(e) => handleInputChange(e, "month")}
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
