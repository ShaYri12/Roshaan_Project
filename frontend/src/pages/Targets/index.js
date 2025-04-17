import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
  ProgressBar,
  Table,
} from "react-bootstrap";
import { REACT_APP_API_URL } from "../../env";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TargetsPage = () => {
  const navigate = useNavigate();

  // State variables
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [currentYear] = useState(new Date().getFullYear());

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);

  // New target form state
  const [newTarget, setNewTarget] = useState({
    name: "",
    description: "",
    baselineYear: new Date().getFullYear() - 1,
    targetYear: new Date().getFullYear() + 5,
    baselineEmissions: 0,
    targetReduction: 30, // Default 30% reduction
    emissionType: "overall", // overall, scope1, scope2, scope3
    milestones: [
      { year: new Date().getFullYear(), targetValue: 0 },
      { year: new Date().getFullYear() + 2, targetValue: 0 },
      { year: new Date().getFullYear() + 5, targetValue: 0 },
    ],
    currentValue: 0,
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

        try {
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`
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
        } catch (validationError) {
          console.error("Token validation error:", validationError);
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setError("Authentication failed. Please log in again.");
        navigate("/");
      }
    };

    checkAuth();
    document.body.className = `${theme}-theme`;

    // Mock fetch targets data since backend implementation is pending
    fetchTargets();
  }, [navigate, theme]);

  // Fetch targets (mock data for now, will be replaced with API call)
  const fetchTargets = async () => {
    setLoading(true);
    try {
      // This will be replaced with actual API call when backend is implemented
      // const response = await authenticatedFetch(`${REACT_APP_API_URL}/targets`);
      // const data = await response.json();

      // Mock data for development purposes
      const mockData = [
        {
          id: "1",
          name: "Carbon Neutral by 2030",
          description:
            "Achieve carbon neutrality across all operations by 2030",
          baselineYear: 2020,
          targetYear: 2030,
          baselineEmissions: 1200,
          targetReduction: 100, // 100% reduction (carbon neutral)
          emissionType: "overall",
          milestones: [
            { year: 2022, targetValue: 1080 }, // 10% reduction from baseline
            { year: 2025, targetValue: 720 }, // 40% reduction from baseline
            { year: 2030, targetValue: 0 }, // 100% reduction from baseline
          ],
          currentValue: 950, // Current emissions value
          createdAt: "2022-01-15T00:00:00.000Z",
        },
        {
          id: "2",
          name: "Scope 1 Emissions Reduction",
          description:
            "Reduce direct emissions from owned or controlled sources",
          baselineYear: 2021,
          targetYear: 2026,
          baselineEmissions: 500,
          targetReduction: 50, // 50% reduction
          emissionType: "scope1",
          milestones: [
            { year: 2022, targetValue: 450 }, // 10% reduction from baseline
            { year: 2024, targetValue: 350 }, // 30% reduction from baseline
            { year: 2026, targetValue: 250 }, // 50% reduction from baseline
          ],
          currentValue: 400, // Current emissions value
          createdAt: "2022-03-10T00:00:00.000Z",
        },
        {
          id: "3",
          name: "Energy Efficiency Target",
          description: "Improve energy efficiency and reduce scope 2 emissions",
          baselineYear: 2021,
          targetYear: 2025,
          baselineEmissions: 800,
          targetReduction: 40, // 40% reduction
          emissionType: "scope2",
          milestones: [
            { year: 2022, targetValue: 720 }, // 10% reduction from baseline
            { year: 2023, targetValue: 640 }, // 20% reduction from baseline
            { year: 2025, targetValue: 480 }, // 40% reduction from baseline
          ],
          currentValue: 650, // Current emissions value
          createdAt: "2022-02-05T00:00:00.000Z",
        },
      ];

      setTargets(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching targets:", error);
      setError("Failed to fetch targets data");
      setLoading(false);
    }
  };

  // Handle new target form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle numeric conversions
    const numericFields = [
      "baselineYear",
      "targetYear",
      "baselineEmissions",
      "targetReduction",
      "currentValue",
    ];
    const parsedValue = numericFields.includes(name)
      ? parseFloat(value)
      : value;

    setNewTarget({
      ...newTarget,
      [name]: parsedValue,
    });

    // If baseline or target years change, update milestones
    if (name === "baselineYear" || name === "targetYear") {
      updateMilestones(
        name === "baselineYear" ? parsedValue : newTarget.baselineYear,
        name === "targetYear" ? parsedValue : newTarget.targetYear
      );
    }

    // If baseline emissions or target reduction change, update milestone values
    if (name === "baselineEmissions" || name === "targetReduction") {
      updateMilestoneValues(
        name === "baselineEmissions"
          ? parsedValue
          : newTarget.baselineEmissions,
        name === "targetReduction" ? parsedValue : newTarget.targetReduction
      );
    }
  };

  // Update milestone years when baseline or target years change
  const updateMilestones = (baselineYear, targetYear) => {
    if (baselineYear >= targetYear) return;

    const duration = targetYear - baselineYear;
    const milestones = [
      { year: baselineYear + 1, targetValue: 0 },
      { year: baselineYear + Math.floor(duration / 2), targetValue: 0 },
      { year: targetYear, targetValue: 0 },
    ];

    setNewTarget((prev) => ({
      ...prev,
      milestones,
    }));

    // Now update the milestone values
    updateMilestoneValues(
      newTarget.baselineEmissions,
      newTarget.targetReduction,
      milestones
    );
  };

  // Update milestone target values based on baseline emissions and target reduction
  const updateMilestoneValues = (
    baselineEmissions,
    targetReduction,
    milestones = newTarget.milestones
  ) => {
    const targetValue = baselineEmissions * (1 - targetReduction / 100);
    const updatedMilestones = [...milestones];

    const baselineYear = newTarget.baselineYear;
    const targetYear = newTarget.targetYear;
    const duration = targetYear - baselineYear;

    updatedMilestones.forEach((milestone, index) => {
      const yearProgress = (milestone.year - baselineYear) / duration;
      const reductionForYear =
        baselineEmissions * (targetReduction / 100) * yearProgress;
      updatedMilestones[index].targetValue =
        Math.round((baselineEmissions - reductionForYear) * 100) / 100;
    });

    setNewTarget((prev) => ({
      ...prev,
      milestones: updatedMilestones,
    }));
  };

  // Handle milestone changes in the form
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...newTarget.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: field === "year" ? parseInt(value) : parseFloat(value),
    };

    setNewTarget({
      ...newTarget,
      milestones: updatedMilestones,
    });
  };

  // Submit new target
  const handleSubmitTarget = async (e) => {
    e.preventDefault();
    try {
      // This will be replaced with actual API call when backend is implemented
      // const response = await authenticatedFetch(`${REACT_APP_API_URL}/targets`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTarget)
      // });

      // Mock response for development
      const mockResponse = {
        ...newTarget,
        id: (targets.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };

      setTargets([...targets, mockResponse]);
      setShowAddModal(false);

      // Reset the form
      setNewTarget({
        name: "",
        description: "",
        baselineYear: new Date().getFullYear() - 1,
        targetYear: new Date().getFullYear() + 5,
        baselineEmissions: 0,
        targetReduction: 30,
        emissionType: "overall",
        milestones: [
          { year: new Date().getFullYear(), targetValue: 0 },
          { year: new Date().getFullYear() + 2, targetValue: 0 },
          { year: new Date().getFullYear() + 5, targetValue: 0 },
        ],
        currentValue: 0,
      });
    } catch (error) {
      console.error("Error creating target:", error);
      setError("Failed to create new target");
    }
  };

  // Update target current value
  const handleUpdateCurrentValue = async (targetId, newValue) => {
    try {
      // This will be replaced with actual API call when backend is implemented
      // const response = await authenticatedFetch(`${REACT_APP_API_URL}/targets/${targetId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentValue: newValue })
      // });

      // Mock update for development
      const updatedTargets = targets.map((target) =>
        target.id === targetId
          ? { ...target, currentValue: parseFloat(newValue) }
          : target
      );

      setTargets(updatedTargets);

      // If this was the selected target in the detail modal, update that too
      if (selectedTarget && selectedTarget.id === targetId) {
        setSelectedTarget({
          ...selectedTarget,
          currentValue: parseFloat(newValue),
        });
      }
    } catch (error) {
      console.error("Error updating target:", error);
      setError("Failed to update target value");
    }
  };

  // Show target details modal
  const showTargetDetails = (target) => {
    setSelectedTarget(target);
    setShowDetailModal(true);
  };

  // Generate progress data for the target
  const calculateProgress = (target) => {
    const totalReduction =
      target.baselineEmissions -
      target.baselineEmissions * (1 - target.targetReduction / 100);
    const currentReduction = target.baselineEmissions - target.currentValue;
    const progressPercentage = (currentReduction / totalReduction) * 100;

    return {
      progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
      currentReduction,
      totalReduction,
      remainingReduction: totalReduction - currentReduction,
      isOnTrack: isTargetOnTrack(target),
    };
  };

  // Check if target is on track based on time elapsed vs reduction achieved
  const isTargetOnTrack = (target) => {
    const totalYears = target.targetYear - target.baselineYear;
    const yearsElapsed = currentYear - target.baselineYear;
    const expectedProgress = (yearsElapsed / totalYears) * 100;

    const totalReduction =
      target.baselineEmissions -
      target.baselineEmissions * (1 - target.targetReduction / 100);
    const currentReduction = target.baselineEmissions - target.currentValue;
    const actualProgress = (currentReduction / totalReduction) * 100;

    // Target is on track if actual progress is at least 90% of expected progress
    return actualProgress >= expectedProgress * 0.9;
  };

  // Generate chart data for a target
  const generateTargetChartData = (target) => {
    // Create array of years from baseline to target
    const years = [];
    for (let year = target.baselineYear; year <= target.targetYear; year++) {
      years.push(year);
    }

    // Create expected reduction line
    const expectedLine = years.map((year) => {
      const progress =
        (year - target.baselineYear) /
        (target.targetYear - target.baselineYear);
      return (
        target.baselineEmissions -
        progress * target.baselineEmissions * (target.targetReduction / 100)
      );
    });

    // Create actual/milestone values
    const actualValues = years.map((year) => {
      if (year === target.baselineYear) return target.baselineEmissions;
      if (year === currentYear) return target.currentValue;

      // Use milestone value if one exists for this year
      const milestone = target.milestones.find((m) => m.year === year);
      return milestone ? milestone.targetValue : null;
    });

    return {
      labels: years,
      datasets: [
        {
          label: "Target Path",
          data: expectedLine,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
        },
        {
          label: "Actual Progress",
          data: actualValues,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
          tension: 0,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  // Handle sidebar functionality
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

  // Get appropriate badge color based on progress
  const getProgressBadgeColor = (progress) => {
    if (progress >= 90) return "success";
    if (progress >= 50) return "info";
    if (progress >= 25) return "warning";
    return "danger";
  };

  // Get emission type label
  const getEmissionTypeLabel = (type) => {
    switch (type) {
      case "scope1":
        return "Scope 1 (Direct)";
      case "scope2":
        return "Scope 2 (Indirect)";
      case "scope3":
        return "Scope 3 (Value Chain)";
      default:
        return "Overall Emissions";
    }
  };

  return (
    <div className="d-flex">
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`content-wrapper ${isSidebarOpen ? "shifted" : ""}`}>
        <div className="container-fluid px-4">
          <div className="row mt-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Emission Reduction Targets</h2>
                <Button variant="success" onClick={() => setShowAddModal(true)}>
                  Set New Target
                </Button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Row>
                  {targets.map((target) => {
                    const progress = calculateProgress(target);
                    return (
                      <Col md={6} lg={4} key={target.id} className="mb-4">
                        <Card className="h-100 target-card">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{target.name}</h5>
                            <span
                              className={`badge bg-${
                                progress.isOnTrack ? "success" : "warning"
                              }`}
                            >
                              {progress.isOnTrack
                                ? "On Track"
                                : "Attention Needed"}
                            </span>
                          </Card.Header>
                          <Card.Body>
                            <div className="target-details mb-3">
                              <p>{target.description}</p>
                              <p>
                                <strong>Type:</strong>{" "}
                                {getEmissionTypeLabel(target.emissionType)}
                              </p>
                              <p>
                                <strong>Target:</strong>{" "}
                                {target.targetReduction}% reduction by{" "}
                                {target.targetYear}
                                <br />
                                <small className="text-muted">
                                  From {target.baselineEmissions} tCO₂e in{" "}
                                  {target.baselineYear}
                                </small>
                              </p>
                            </div>

                            <div className="progress-section mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span>
                                  Progress:{" "}
                                  {progress.progressPercentage.toFixed(1)}%
                                </span>
                                <span
                                  className={`badge bg-${getProgressBadgeColor(
                                    progress.progressPercentage
                                  )}`}
                                >
                                  {progress.currentReduction.toFixed(2)} /{" "}
                                  {progress.totalReduction.toFixed(2)} tCO₂e
                                </span>
                              </div>
                              <ProgressBar
                                now={progress.progressPercentage}
                                variant={getProgressBadgeColor(
                                  progress.progressPercentage
                                )}
                                className="mb-3"
                              />

                              <div className="d-flex justify-content-between update-emission-value">
                                <Form.Control
                                  type="number"
                                  placeholder="Current Value"
                                  value={target.currentValue}
                                  onChange={(e) =>
                                    handleUpdateCurrentValue(
                                      target.id,
                                      e.target.value
                                    )
                                  }
                                  className="me-2"
                                />
                                <div className="d-flex">
                                  <Button
                                    variant="info"
                                    onClick={() => showTargetDetails(target)}
                                    className="ms-2"
                                  >
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                          <Card.Footer className="text-muted">
                            Created:{" "}
                            {new Date(target.createdAt).toLocaleDateString()}
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Target Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Set New Emission Reduction Target</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitTarget}>
            <Form.Group className="mb-3">
              <Form.Label>Target Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newTarget.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Carbon Neutral by 2030"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newTarget.description}
                onChange={handleInputChange}
                required
                placeholder="Describe the target and its importance"
                rows={2}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Emission Type</Form.Label>
              <Form.Select
                name="emissionType"
                value={newTarget.emissionType}
                onChange={handleInputChange}
                required
              >
                <option value="overall">Overall Emissions</option>
                <option value="scope1">Scope 1 (Direct)</option>
                <option value="scope2">Scope 2 (Indirect)</option>
                <option value="scope3">Scope 3 (Value Chain)</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Baseline Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="baselineYear"
                    value={newTarget.baselineYear}
                    onChange={handleInputChange}
                    required
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="targetYear"
                    value={newTarget.targetYear}
                    onChange={handleInputChange}
                    required
                    min={new Date().getFullYear()}
                    max="2050"
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
                    name="baselineEmissions"
                    value={newTarget.baselineEmissions}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Reduction (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="targetReduction"
                    value={newTarget.targetReduction}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Current Emissions Value (tCO₂e)</Form.Label>
              <Form.Control
                type="number"
                name="currentValue"
                value={newTarget.currentValue}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>

            <div className="mb-3">
              <Form.Label>Milestones</Form.Label>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Target Value (tCO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  {newTarget.milestones.map((milestone, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="number"
                          value={milestone.year}
                          onChange={(e) =>
                            handleMilestoneChange(index, "year", e.target.value)
                          }
                          min={newTarget.baselineYear}
                          max={newTarget.targetYear}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={milestone.targetValue}
                          onChange={(e) =>
                            handleMilestoneChange(
                              index,
                              "targetValue",
                              e.target.value
                            )
                          }
                          min="0"
                          step="0.01"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmitTarget}>
            Set Target
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Target Detail Modal */}
      {selectedTarget && (
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedTarget.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="target-chart mb-4">
              <h5 className="text-center mb-3">Emission Reduction Progress</h5>
              <div style={{ height: "300px" }}>
                <Line
                  data={generateTargetChartData(selectedTarget)}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: "Emissions (tCO₂e)",
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: "Year",
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${
                              context.dataset.label
                            }: ${context.parsed.y.toFixed(2)} tCO₂e`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="target-details mb-4">
              <h5>Target Details</h5>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Emission Type:</strong>{" "}
                    {getEmissionTypeLabel(selectedTarget.emissionType)}
                  </p>
                  <p>
                    <strong>Baseline Year:</strong>{" "}
                    {selectedTarget.baselineYear}
                  </p>
                  <p>
                    <strong>Baseline Emissions:</strong>{" "}
                    {selectedTarget.baselineEmissions} tCO₂e
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Target Year:</strong> {selectedTarget.targetYear}
                  </p>
                  <p>
                    <strong>Target Reduction:</strong>{" "}
                    {selectedTarget.targetReduction}%
                  </p>
                  <p>
                    <strong>Target Emissions:</strong>{" "}
                    {(
                      selectedTarget.baselineEmissions *
                      (1 - selectedTarget.targetReduction / 100)
                    ).toFixed(2)}{" "}
                    tCO₂e
                  </p>
                </Col>
              </Row>
            </div>

            <div className="milestone-details">
              <h5>Milestones</h5>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Target Value (tCO₂e)</th>
                    <th>Reduction from Baseline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      year: selectedTarget.baselineYear,
                      targetValue: selectedTarget.baselineEmissions,
                    },
                    ...selectedTarget.milestones,
                  ].map((milestone, index) => {
                    const reduction =
                      selectedTarget.baselineEmissions - milestone.targetValue;
                    const reductionPercent =
                      (reduction / selectedTarget.baselineEmissions) * 100;
                    const isPast = milestone.year <= currentYear;
                    let status = "Future";

                    if (isPast) {
                      if (milestone.year === selectedTarget.baselineYear) {
                        status = "Baseline";
                      } else if (
                        selectedTarget.currentValue <= milestone.targetValue
                      ) {
                        status = "Achieved";
                      } else {
                        status = "Missed";
                      }
                    }

                    return (
                      <tr key={index}>
                        <td>{milestone.year}</td>
                        <td>{milestone.targetValue.toFixed(2)} tCO₂e</td>
                        <td>
                          {reduction.toFixed(2)} tCO₂e (
                          {reductionPercent.toFixed(1)}%)
                        </td>
                        <td>
                          <span
                            className={`badge bg-${
                              status === "Achieved"
                                ? "success"
                                : status === "Missed"
                                ? "danger"
                                : status === "Baseline"
                                ? "secondary"
                                : "info"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="table-active">
                    <td>{currentYear} (Current)</td>
                    <td>{selectedTarget.currentValue.toFixed(2)} tCO₂e</td>
                    <td>
                      {(
                        selectedTarget.baselineEmissions -
                        selectedTarget.currentValue
                      ).toFixed(2)}{" "}
                      tCO₂e (
                      {(
                        ((selectedTarget.baselineEmissions -
                          selectedTarget.currentValue) /
                          selectedTarget.baselineEmissions) *
                        100
                      ).toFixed(1)}
                      %)
                    </td>
                    <td>
                      <span
                        className={`badge bg-${
                          calculateProgress(selectedTarget).isOnTrack
                            ? "success"
                            : "warning"
                        }`}
                      >
                        {calculateProgress(selectedTarget).isOnTrack
                          ? "On Track"
                          : "Behind Target"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </Button>
            <Button variant="primary" onClick={() => window.print()}>
              Print Report
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default TargetsPage;
