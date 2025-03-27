import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaHome, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const EmissionTypesPage = () => {
  const [emissionTypes, setEmissionTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEmissionType, setCurrentEmissionType] = useState({
    name: "",
    conversionFactor: "",
  });
  const [editEmissionTypeId, setEditEmissionTypeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmissionTypes = async () => {
      setLoading(true);
      try {
        console.log("Fetching emission types...");
        console.log("API URL:", `${REACT_APP_API_URL}/emission-types`);

        const response = await fetch(`${REACT_APP_API_URL}/emission-types`, {
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
          throw new Error(`Failed to fetch emission types: ${response.status}`);
        }

        const data = await response.json();
        console.log("Emission types data:", data);
        setEmissionTypes(data);
      } catch (error) {
        console.error("Error fetching emission types:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmissionTypes();
  }, []);

  const handleAddEmissionType = () => {
    setCurrentEmissionType({ name: "", conversionFactor: "" });
    setShowAddModal(true);
  };

  const handleEditEmissionType = (emissionType) => {
    setCurrentEmissionType(emissionType);
    setEditEmissionTypeId(emissionType._id);
    setShowEditModal(true);
  };

  const handleDeleteEmissionType = async (id) => {
    try {
      await axios.delete(`${REACT_APP_API_URL}/emission-types/${id}`, {
        headers: {
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      setEmissionTypes(emissionTypes.filter((type) => type._id !== id));
    } catch (error) {
      console.error("Error deleting emission type:", error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${REACT_APP_API_URL}/emission-types`,
        currentEmissionType,
        {
          headers: {
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );
      setEmissionTypes([...emissionTypes, response.data]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding emission type:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${REACT_APP_API_URL}/emission-types/${editEmissionTypeId}`,
        currentEmissionType,
        {
          headers: {
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );
      setEmissionTypes(
        emissionTypes.map((type) =>
          type._id === editEmissionTypeId ? response.data : type
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error editing emission type:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmissionType((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-chart-line fa-2x me-3"></i>
            <h4 className="card-title mb-0">Emission Types</h4>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome className="me-2" /> Home
          </button>
        </div>
      </nav>

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
          <p className="mb-0">Total Emission Types: {emissionTypes.length}</p>
          <button className="btn btn-success" onClick={handleAddEmissionType}>
            <FaPlus className="me-2" /> Add New Emission Type
          </button>
        </div>

        {loading && (
          <div className="alert alert-info">Loading emission types...</div>
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
                <th>Name</th>
                <th>Conversion Factor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emissionTypes.length > 0
                ? emissionTypes.map((type, index) => (
                    <tr key={type._id}>
                      <td>{index + 1}</td>
                      <td>{type.name}</td>
                      <td>{type.conversionFactor}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => handleEditEmissionType(type)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteEmissionType(type._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No emission types found
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        <Modal
          className="custom-scrollbar"
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Emission Type</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={currentEmissionType.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="conversionFactor" className="mb-3">
                <Form.Label>Conversion Factor</Form.Label>
                <Form.Control
                  type="number"
                  name="conversionFactor"
                  value={currentEmissionType.conversionFactor}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Save Emission Type
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Edit Modal */}
        <Modal
          className="custom-scrollbar"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Emission Type</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={currentEmissionType.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="conversionFactor" className="mb-3">
                <Form.Label>Conversion Factor</Form.Label>
                <Form.Control
                  type="number"
                  name="conversionFactor"
                  value={currentEmissionType.conversionFactor}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Update Emission Type
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default EmissionTypesPage;
