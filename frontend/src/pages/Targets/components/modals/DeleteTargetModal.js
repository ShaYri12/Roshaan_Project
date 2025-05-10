import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteTargetModal = ({
  showModal,
  setShowModal,
  selectedTarget,
  handleDeleteTarget,
}) => {
  // Handle modal close
  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the target "
          {selectedTarget?.name || ""}"? This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteTarget}>
          Delete Target
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTargetModal;
