import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { REACT_APP_API_URL } from "../env";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaTrash, FaEdit } from "react-icons/fa";

const ScenariosPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 5,
    baselineEmissions: 0,
    targetReduction: 0,
    measures: [],
  });

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/auth/validate-token`,
          { method: "GET" }
        );

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        } else {
          const userObj = JSON.parse(localStorage.getItem("userObj"));
          setUserData(userObj);
        }
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/scenarios`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setScenarios(data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        setError("Failed to load scenarios");
      }
    };

    fetchScenarios();
  }, []);

  const handleAddScenario = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/scenarios`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      setScenarios([...scenarios, data]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding scenario:", error);
      setError("Failed to add scenario");
    }
  };

  const handleEditScenario = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/scenarios/${selectedScenario._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      setScenarios(
        scenarios.map((s) => (s._id === selectedScenario._id ? data : s))
      );
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Error updating scenario:", error);
      setError("Failed to update scenario");
    }
  };

  const handleDeleteScenario = async () => {
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/scenarios/${selectedScenario._id}`,
        {
          method: "DELETE",
        }
      );
      setScenarios(scenarios.filter((s) => s._id !== selectedScenario._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting scenario:", error);
      setError("Failed to delete scenario");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 5,
      baselineEmissions: 0,
      targetReduction: 0,
      measures: [],
    });
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

  // Chart data for scenario comparison
  const comparisonChartData = {
    labels: scenarios.map((s) => s.name),
    datasets: [
      {
        label: "Baseline Emissions (tCO₂e)",
        data: scenarios.map((s) => s.baselineEmissions),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Target Reduction (tCO₂e)",
        data: scenarios.map((s) => s.targetReduction),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
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
            <h1>Emission Reduction Scenarios</h1>
            <Button
              variant="outline-success"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlusCircle className="me-2" /> Create New Scenario
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Scenarios Overview */}
          <Row className="mb-4">
            <Col>
              <Card className={`bg-${theme} m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">Scenarios Comparison</Card.Title>
                  <div style={{ height: "400px", padding: "20px" }}>
                    <Line
                      data={comparisonChartData}
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
                                size: 12,
                              },
                            },
                            title: {
                              display: true,
                              text: "Emissions (tCO₂e)",
                              color: theme === "dark" ? "#fff" : "#666",
                              font: {
                                size: 14,
                                weight: "bold",
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
                                size: 12,
                              },
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "top",
                            labels: {
                              padding: 20,
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
                            padding: 12,
                            displayColors: true,
                          },
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Scenarios List */}
          <Row>
            {scenarios.map((scenario) => (
              <Col key={scenario._id} lg={4} md={6} className="mb-4">
                <Card className={`bg-${theme} h-100 m-0`}>
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-center">
                      {scenario.name}
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setSelectedScenario(scenario);
                            setFormData(scenario);
                            setShowEditModal(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedScenario(scenario);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </Card.Title>
                    <Card.Text>{scenario.description}</Card.Text>
                    <hr />
                    <div className="mb-2">
                      <strong>Timeline:</strong> {scenario.startYear} -{" "}
                      {scenario.endYear}
                    </div>
                    <div className="mb-2">
                      <strong>Baseline Emissions:</strong>{" "}
                      {scenario.baselineEmissions} tCO₂e
                    </div>
                    <div>
                      <strong>Target Reduction:</strong>{" "}
                      {scenario.targetReduction} tCO₂e (
                      {(
                        (scenario.targetReduction /
                          scenario.baselineEmissions) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Add Scenario Modal */}
          <Modal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Create New Scenario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddScenario}>
                <Form.Group className="mb-3">
                  <Form.Label>Scenario Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.startYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startYear: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.endYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endYear: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Baseline Emissions (tCO₂e)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.baselineEmissions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baselineEmissions: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Reduction (tCO₂e)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.targetReduction}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetReduction: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddModal(false)}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Scenario
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Edit Scenario Modal */}
          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Scenario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditScenario}>
                {/* Same form fields as Add Modal */}
                <Form.Group className="mb-3">
                  <Form.Label>Scenario Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.startYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startYear: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.endYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endYear: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Baseline Emissions (tCO₂e)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.baselineEmissions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baselineEmissions: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Reduction (tCO₂e)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.targetReduction}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetReduction: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Update Scenario
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete the scenario "
              {selectedScenario?.name}"?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteScenario}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ScenariosPage;
