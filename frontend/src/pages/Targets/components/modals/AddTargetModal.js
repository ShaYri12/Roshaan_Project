import React from "react";
import { Modal, Form, Button, Row, Col, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const AddTargetModal = ({
  showModal,
  setShowModal,
  formData,
  setFormData,
  handleAddTarget,
  setShowMilestoneModal,
  scenarios,
  openEditMilestoneModal,
  removeMilestone,
}) => {
  // Handle modal close to ensure form reset
  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
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
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Target
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTargetModal;
