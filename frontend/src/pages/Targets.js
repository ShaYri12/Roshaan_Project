import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  ProgressBar,
  Table,
} from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { REACT_APP_API_URL } from "../env";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";

const TargetsPage = () => {
  const [targets, setTargets] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetYear: new Date().getFullYear() + 5,
    reductionGoal: 0,
    baselineYear: new Date().getFullYear(),
    baselineEmissions: 0,
    status: "active",
    scenarioId: "",
    milestones: [],
  });

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneData, setMilestoneData] = useState({
    year: new Date().getFullYear(),
    targetReduction: 0,
    actualReduction: 0,
    status: "pending",
  });
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);

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

  // Fetch targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/targets`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setTargets(data);
      } catch (error) {
        console.error("Error fetching targets:", error);
        setError("Failed to load targets");
      }
    };

    fetchTargets();
  }, []);

  // Add useEffect to fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/scenarios`,
          { method: "GET" }
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

  const handleAddTarget = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/targets`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      setTargets([...targets, data]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding target:", error);
      setError("Failed to add target");
    }
  };

  const handleEditTarget = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/targets/${selectedTarget._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      setTargets(targets.map((t) => (t._id === selectedTarget._id ? data : t)));
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Error updating target:", error);
      setError("Failed to update target");
    }
  };

  const handleDeleteTarget = async () => {
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/targets/${selectedTarget._id}`,
        {
          method: "DELETE",
        }
      );
      setTargets(targets.filter((t) => t._id !== selectedTarget._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting target:", error);
      setError("Failed to delete target");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      targetYear: new Date().getFullYear() + 5,
      reductionGoal: 0,
      baselineYear: new Date().getFullYear(),
      baselineEmissions: 0,
      status: "active",
      scenarioId: "",
      milestones: [],
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

  // Calculate progress percentage for a target
  const calculateProgress = (target) => {
    if (!target) return 0;

    // Calculate the total reduction goal
    const totalReductionGoal = target.reductionGoal;

    // If no reduction goal is set, return 0 to avoid division by zero
    if (!totalReductionGoal || totalReductionGoal <= 0) return 0;

    // Calculate current reduction based on most recent milestone if available
    let currentReduction = 0;
    if (target.milestones && target.milestones.length > 0) {
      // Sort milestones by year (descending) and get the most recent one
      const sortedMilestones = [...target.milestones].sort(
        (a, b) => b.year - a.year
      );
      const latestMilestone = sortedMilestones[0];
      currentReduction = latestMilestone.actualReduction || 0;
    }

    // Calculate progress percentage
    const progressPercentage = (currentReduction / totalReductionGoal) * 100;

    // Ensure the percentage is between 0 and 100
    return Math.min(100, Math.max(0, progressPercentage));
  };

  // Chart data for target progress
  const progressChartData = {
    labels: targets.map((t) => t.name),
    datasets: [
      {
        label: "Progress (%)",
        data: targets.map((t) => calculateProgress(t)),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...(formData.milestones || []), { ...milestoneData }],
    });
    setShowMilestoneModal(false);
    // Reset milestone form
    setMilestoneData({
      year: new Date().getFullYear(),
      targetReduction: 0,
      actualReduction: 0,
      status: "pending",
    });
  };

  const editMilestone = () => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[selectedMilestoneIndex] = { ...milestoneData };
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
    setShowEditMilestoneModal(false);
    setSelectedMilestoneIndex(null);
    // Reset milestone form
    setMilestoneData({
      year: new Date().getFullYear(),
      targetReduction: 0,
      actualReduction: 0,
      status: "pending",
    });
  };

  const removeMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
  };

  const openEditMilestoneModal = (index) => {
    setSelectedMilestoneIndex(index);
    setMilestoneData({ ...formData.milestones[index] });
    setShowEditMilestoneModal(true);
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
            <h1>Emission Reduction Targets</h1>
            <Button
              variant="outline-success"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlusCircle className="me-2" /> Add New Target
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Progress Overview */}
          <Row className="mb-4">
            <Col>
              <Card className={`bg-${theme} m-0`}>
                <Card.Body>
                  <Card.Title className="mb-4">
                    Target Progress Overview
                  </Card.Title>
                  <div style={{ height: "400px", padding: "20px" }}>
                    <Line
                      data={progressChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
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
                              text: "Progress (%)",
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

          {/* Targets List */}
          <Row>
            {targets.map((target) => (
              <Col key={target._id} xl={4} md={6} className="mb-4">
                <Card className={`bg-${theme} m-0 h-100`}>
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-center">
                      {target.name}
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setSelectedTarget(target);
                            setFormData({
                              ...target,
                              scenarioId:
                                target.scenarioId?._id || target.scenarioId,
                            });
                            setShowEditModal(true);
                          }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedTarget(target);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </Card.Title>
                    <Card.Text>{target.description}</Card.Text>
                    <div className="mb-2">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`badge bg-${
                          target.status === "active"
                            ? "primary"
                            : target.status === "achieved"
                            ? "success"
                            : target.status === "missed"
                            ? "danger"
                            : "secondary"
                        }`}
                      >
                        {target.status.charAt(0).toUpperCase() +
                          target.status.slice(1)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Scenario:</strong>{" "}
                      {target.scenarioId?.name || "No scenario linked"}
                    </div>
                    <div className="mb-2">
                      <strong>Timeline:</strong> {target.baselineYear} -{" "}
                      {target.targetYear}
                    </div>
                    <div className="mb-2">
                      <strong>Baseline Emissions:</strong>{" "}
                      {target.baselineEmissions} tCO₂e
                    </div>
                    <div className="mb-2">
                      <strong>Reduction Goal:</strong> {target.reductionGoal}{" "}
                      tCO₂e (
                      {(
                        (target.reductionGoal / target.baselineEmissions) *
                        100
                      ).toFixed(1)}
                      %)
                    </div>
                    <div className="mt-3">
                      <strong>Progress:</strong>
                      <ProgressBar
                        now={calculateProgress(target)}
                        label={`${calculateProgress(target).toFixed(1)}%`}
                        variant={
                          calculateProgress(target) >= 100
                            ? "success"
                            : calculateProgress(target) >= 50
                            ? "info"
                            : "warning"
                        }
                        className="mt-2"
                      />
                    </div>
                    {target.milestones && target.milestones.length > 0 && (
                      <div className="mt-3">
                        <strong>Latest Milestone:</strong>
                        {
                          target.milestones.sort((a, b) => b.year - a.year)[0]
                            .year
                        }{" "}
                        -
                        {
                          target.milestones.sort((a, b) => b.year - a.year)[0]
                            .status
                        }
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Add Target Modal */}
          <Modal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Target</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAddTarget}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Name</Form.Label>
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

                <Form.Group className="mb-3">
                  <Form.Label>Scenario</Form.Label>
                  <Form.Select
                    value={formData.scenarioId}
                    onChange={(e) =>
                      setFormData({ ...formData, scenarioId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a scenario</option>
                    {scenarios.map((scenario) => (
                      <option key={scenario._id} value={scenario._id}>
                        {scenario.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Baseline Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.baselineYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baselineYear: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.targetYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetYear: parseInt(e.target.value),
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
                      <Form.Label>Reduction Goal (tCO₂e)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.reductionGoal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reductionGoal: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Missed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Milestones</h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowMilestoneModal(true)}
                    >
                      Add Milestone
                    </Button>
                  </div>
                  {formData.milestones && formData.milestones.length > 0 ? (
                    <Table striped hover responsive size="sm">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Target Reduction</th>
                          <th>Actual Reduction</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.milestones.map((milestone, index) => (
                          <tr key={index}>
                            <td>{milestone.year}</td>
                            <td>{milestone.targetReduction} tCO₂e</td>
                            <td>{milestone.actualReduction} tCO₂e</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  milestone.status === "pending"
                                    ? "warning"
                                    : milestone.status === "achieved"
                                    ? "success"
                                    : "danger"
                                }`}
                              >
                                {milestone.status.charAt(0).toUpperCase() +
                                  milestone.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => openEditMilestoneModal(index)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeMilestone(index)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No milestones added yet.</p>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddModal(false)}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Add Target
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Edit Target Modal */}
          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Target</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEditTarget}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Name</Form.Label>
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

                <Form.Group className="mb-3">
                  <Form.Label>Scenario</Form.Label>
                  <Form.Select
                    value={formData.scenarioId}
                    onChange={(e) =>
                      setFormData({ ...formData, scenarioId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a scenario</option>
                    {scenarios.map((scenario) => (
                      <option key={scenario._id} value={scenario._id}>
                        {scenario.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Baseline Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.baselineYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baselineYear: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Target Year</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.targetYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetYear: parseInt(e.target.value),
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
                      <Form.Label>Reduction Goal (tCO₂e)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formData.reductionGoal}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reductionGoal: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Missed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Milestones</h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowMilestoneModal(true)}
                    >
                      Add Milestone
                    </Button>
                  </div>
                  {formData.milestones && formData.milestones.length > 0 ? (
                    <Table striped hover responsive size="sm">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Target Reduction</th>
                          <th>Actual Reduction</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.milestones.map((milestone, index) => (
                          <tr key={index}>
                            <td>{milestone.year}</td>
                            <td>{milestone.targetReduction} tCO₂e</td>
                            <td>{milestone.actualReduction} tCO₂e</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  milestone.status === "pending"
                                    ? "warning"
                                    : milestone.status === "achieved"
                                    ? "success"
                                    : "danger"
                                }`}
                              >
                                {milestone.status.charAt(0).toUpperCase() +
                                  milestone.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => openEditMilestoneModal(index)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeMilestone(index)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted">No milestones added yet.</p>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Update Target
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
              Are you sure you want to delete the target "{selectedTarget?.name}
              "?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteTarget}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Milestone Modal */}
          <Modal
            show={showMilestoneModal}
            onHide={() => setShowMilestoneModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Milestone</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={milestoneData.year}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        year: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Target Reduction (tCO₂e)</Form.Label>
                  <Form.Control
                    type="number"
                    value={milestoneData.targetReduction}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        targetReduction: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Actual Reduction (tCO₂e)</Form.Label>
                  <Form.Control
                    type="number"
                    value={milestoneData.actualReduction}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        actualReduction: parseFloat(e.target.value),
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={milestoneData.status}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Missed</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowMilestoneModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={addMilestone}>
                Add Milestone
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Edit Milestone Modal */}
          <Modal
            show={showEditMilestoneModal}
            onHide={() => setShowEditMilestoneModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Milestone</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={milestoneData.year}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        year: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Target Reduction (tCO₂e)</Form.Label>
                  <Form.Control
                    type="number"
                    value={milestoneData.targetReduction}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        targetReduction: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Actual Reduction (tCO₂e)</Form.Label>
                  <Form.Control
                    type="number"
                    value={milestoneData.actualReduction}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        actualReduction: parseFloat(e.target.value),
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={milestoneData.status}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="achieved">Achieved</option>
                    <option value="missed">Missed</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditMilestoneModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={editMilestone}>
                Update Milestone
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TargetsPage;
