import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Card, Row, Col, Table } from "react-bootstrap";
import { REACT_APP_API_URL } from "../../env";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Register the required chart components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const ScenariosPage = () => {
  const navigate = useNavigate();

  // State variables
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);

  // New scenario form state
  const [newScenario, setNewScenario] = useState({
    name: "",
    description: "",
    targetReduction: 0,
    timeframeYears: 1,
    measures: [{ name: "", description: "", estimatedReduction: 0 }],
    baselineEmissions: 0,
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

    // Mock fetch scenarios data since backend implementation is pending
    fetchScenarios();
  }, [navigate, theme]);

  // Fetch scenarios (mock data for now, will be replaced with API call)
  const fetchScenarios = async () => {
    setLoading(true);
    try {
      // This will be replaced with actual API call when backend is implemented
      // const response = await authenticatedFetch(`${REACT_APP_API_URL}/scenarios`);
      // const data = await response.json();

      // Mock data for development purposes
      const mockData = [
        {
          id: "1",
          name: "Renewable Energy Transition",
          description: "Transition to 80% renewable energy sources",
          targetReduction: 30,
          timeframeYears: 5,
          measures: [
            {
              name: "Solar Panel Installation",
              description: "Install solar panels on all facilities",
              estimatedReduction: 15,
            },
            {
              name: "Wind Energy Contract",
              description: "Contract with wind energy supplier",
              estimatedReduction: 10,
            },
            {
              name: "Energy Efficiency",
              description: "Improve energy efficiency in buildings",
              estimatedReduction: 5,
            },
          ],
          baselineEmissions: 1000,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Transport Optimization",
          description: "Optimize transportation and logistics",
          targetReduction: 25,
          timeframeYears: 3,
          measures: [
            {
              name: "Electric Vehicle Fleet",
              description: "Convert company fleet to electric vehicles",
              estimatedReduction: 15,
            },
            {
              name: "Route Optimization",
              description: "Optimize delivery routes",
              estimatedReduction: 7,
            },
            {
              name: "Remote Work Policy",
              description: "Implement remote work policy",
              estimatedReduction: 3,
            },
          ],
          baselineEmissions: 800,
          createdAt: new Date().toISOString(),
        },
      ];

      setScenarios(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      setError("Failed to fetch scenarios data");
      setLoading(false);
    }
  };

  // Handle new scenario form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewScenario({
      ...newScenario,
      [name]: value,
    });
  };

  // Handle changes to measures in the form
  const handleMeasureChange = (index, field, value) => {
    const updatedMeasures = [...newScenario.measures];
    updatedMeasures[index] = {
      ...updatedMeasures[index],
      [field]: field === "estimatedReduction" ? parseFloat(value) : value,
    };

    setNewScenario({
      ...newScenario,
      measures: updatedMeasures,
    });
  };

  // Add a new measure field
  const addMeasure = () => {
    setNewScenario({
      ...newScenario,
      measures: [
        ...newScenario.measures,
        { name: "", description: "", estimatedReduction: 0 },
      ],
    });
  };

  // Remove a measure field
  const removeMeasure = (index) => {
    if (newScenario.measures.length > 1) {
      const updatedMeasures = newScenario.measures.filter(
        (_, i) => i !== index
      );
      setNewScenario({
        ...newScenario,
        measures: updatedMeasures,
      });
    }
  };

  // Submit new scenario
  const handleSubmitScenario = async (e) => {
    e.preventDefault();
    try {
      // This will be replaced with actual API call when backend is implemented
      // const response = await authenticatedFetch(`${REACT_APP_API_URL}/scenarios`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newScenario)
      // });

      // Mock response for development
      const mockResponse = {
        ...newScenario,
        id: (scenarios.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };

      setScenarios([...scenarios, mockResponse]);
      setShowAddModal(false);
      setNewScenario({
        name: "",
        description: "",
        targetReduction: 0,
        timeframeYears: 1,
        measures: [{ name: "", description: "", estimatedReduction: 0 }],
        baselineEmissions: 0,
      });
    } catch (error) {
      console.error("Error creating scenario:", error);
      setError("Failed to create new scenario");
    }
  };

  // Toggle scenario selection for comparison
  const toggleScenarioSelection = (id) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(
        selectedScenarios.filter((scenarioId) => scenarioId !== id)
      );
    } else {
      if (selectedScenarios.length < 3) {
        // Limit to comparing 3 scenarios at once
        setSelectedScenarios([...selectedScenarios, id]);
      }
    }
  };

  // Compare selected scenarios
  const compareScenarios = () => {
    if (selectedScenarios.length < 2) {
      setError("Select at least two scenarios to compare");
      return;
    }

    const scenariosToCompare = scenarios.filter((scenario) =>
      selectedScenarios.includes(scenario.id)
    );

    setComparisonData(scenariosToCompare);
    setShowCompareModal(true);
  };

  // Generate chart data for comparison
  const generateComparisonChartData = () => {
    if (!comparisonData) return null;

    return {
      labels: comparisonData.map((scenario) => scenario.name),
      datasets: [
        {
          label: "Target Reduction (%)",
          data: comparisonData.map((scenario) => scenario.targetReduction),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate measures chart data
  const generateMeasuresChartData = (scenario) => {
    return {
      labels: scenario.measures.map((measure) => measure.name),
      datasets: [
        {
          label: "Estimated Reduction (%)",
          data: scenario.measures.map((measure) => measure.estimatedReduction),
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderWidth: 1,
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
                <h2>Emission Reduction Scenarios</h2>
                <div>
                  {selectedScenarios.length > 1 && (
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={compareScenarios}
                    >
                      Compare Selected ({selectedScenarios.length})
                    </Button>
                  )}
                  <Button
                    variant="success"
                    onClick={() => setShowAddModal(true)}
                  >
                    Create New Scenario
                  </Button>
                </div>
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
                  {scenarios.map((scenario) => (
                    <Col md={6} lg={4} key={scenario.id} className="mb-4">
                      <Card
                        className={`scenario-card h-100 ${
                          selectedScenarios.includes(scenario.id)
                            ? "border-primary"
                            : ""
                        }`}
                        onClick={() => toggleScenarioSelection(scenario.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">{scenario.name}</h5>
                          <Form.Check
                            type="checkbox"
                            checked={selectedScenarios.includes(scenario.id)}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Card.Header>
                        <Card.Body>
                          <div className="scenario-details mb-3">
                            <p>{scenario.description}</p>
                            <p>
                              <strong>Target Reduction:</strong>{" "}
                              {scenario.targetReduction}%
                            </p>
                            <p>
                              <strong>Timeframe:</strong>{" "}
                              {scenario.timeframeYears} years
                            </p>
                            <p>
                              <strong>Baseline Emissions:</strong>{" "}
                              {scenario.baselineEmissions} tCO₂e
                            </p>
                          </div>

                          <div className="scenario-chart">
                            <h6>Reduction Measures</h6>
                            <div style={{ height: "200px" }}>
                              <Pie
                                data={generateMeasuresChartData(scenario)}
                                options={{
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                    },
                                  },
                                }}
                              />
                            </div>
                          </div>
                        </Card.Body>
                        <Card.Footer className="text-muted">
                          Created:{" "}
                          {new Date(scenario.createdAt).toLocaleDateString()}
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Scenario Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Emission Reduction Scenario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitScenario}>
            <Form.Group className="mb-3">
              <Form.Label>Scenario Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newScenario.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Energy Efficiency Improvement"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newScenario.description}
                onChange={handleInputChange}
                required
                placeholder="Describe the overall scenario and its objectives"
                rows={3}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Reduction (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="targetReduction"
                    value={newScenario.targetReduction}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Timeframe (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="timeframeYears"
                    value={newScenario.timeframeYears}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="30"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Baseline Emissions (tCO₂e)</Form.Label>
              <Form.Control
                type="number"
                name="baselineEmissions"
                value={newScenario.baselineEmissions}
                onChange={handleInputChange}
                required
                min="0"
              />
            </Form.Group>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Reduction Measures</Form.Label>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addMeasure}
                >
                  Add Measure
                </Button>
              </div>

              {newScenario.measures.map((measure, index) => (
                <div
                  key={index}
                  className="measure-item p-3 border rounded mb-3"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Measure #{index + 1}</h6>
                    {newScenario.measures.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeMeasure(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={measure.name}
                          onChange={(e) =>
                            handleMeasureChange(index, "name", e.target.value)
                          }
                          required
                          placeholder="e.g., Solar Panel Installation"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Estimated Reduction (%)</Form.Label>
                        <Form.Control
                          type="number"
                          value={measure.estimatedReduction}
                          onChange={(e) =>
                            handleMeasureChange(
                              index,
                              "estimatedReduction",
                              e.target.value
                            )
                          }
                          required
                          min="0"
                          max="100"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={measure.description}
                      onChange={(e) =>
                        handleMeasureChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      required
                      placeholder="Describe this specific measure"
                      rows={2}
                    />
                  </Form.Group>
                </div>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmitScenario}>
            Create Scenario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Compare Scenarios Modal */}
      <Modal
        show={showCompareModal}
        onHide={() => setShowCompareModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Scenario Comparison</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {comparisonData && (
            <>
              <div className="comparison-chart mb-4">
                <h5 className="text-center mb-3">
                  Target Reduction Comparison
                </h5>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={generateComparisonChartData()}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Reduction (%)",
                          },
                          max: 100,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Target (%)</th>
                    <th>Timeframe</th>
                    <th>Measures</th>
                    <th>Baseline Emissions</th>
                    <th>Projected Emissions</th>
                    <th>Reduction (tCO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((scenario) => (
                    <tr key={scenario.id}>
                      <td>{scenario.name}</td>
                      <td>{scenario.targetReduction}%</td>
                      <td>{scenario.timeframeYears} years</td>
                      <td>{scenario.measures.length}</td>
                      <td>{scenario.baselineEmissions} tCO₂e</td>
                      <td>
                        {(
                          scenario.baselineEmissions *
                          (1 - scenario.targetReduction / 100)
                        ).toFixed(2)}{" "}
                        tCO₂e
                      </td>
                      <td>
                        {(
                          (scenario.baselineEmissions *
                            scenario.targetReduction) /
                          100
                        ).toFixed(2)}{" "}
                        tCO₂e
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <h5 className="mt-4 mb-3">Detailed Measures Comparison</h5>
              {comparisonData.map((scenario) => (
                <div key={scenario.id} className="scenario-measures mb-4">
                  <h6>{scenario.name}</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Measure</th>
                        <th>Description</th>
                        <th>Reduction (%)</th>
                        <th>Impact (tCO₂e)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.measures.map((measure, index) => (
                        <tr key={index}>
                          <td>{measure.name}</td>
                          <td>{measure.description}</td>
                          <td>{measure.estimatedReduction}%</td>
                          <td>
                            {(
                              (scenario.baselineEmissions *
                                measure.estimatedReduction) /
                              100
                            ).toFixed(2)}{" "}
                            tCO₂e
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCompareModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print Comparison
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScenariosPage;
