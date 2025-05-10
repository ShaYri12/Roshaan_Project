import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const EditMilestoneModal = ({
  showModal,
  setShowModal,
  milestoneData,
  setMilestoneData,
  editMilestone,
}) => {
  // Handle modal close
  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
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

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" onClick={editMilestone}>
              Update Milestone
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditMilestoneModal;
