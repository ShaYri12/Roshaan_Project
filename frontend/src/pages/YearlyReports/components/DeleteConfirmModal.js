import React from "react";

const DeleteConfirmModal = ({
  theme,
  showDeleteConfirm,
  setShowDeleteConfirm,
  deleteReport,
  isDeleting,
}) => {
  return (
    <>
      <div
        className={`modal fade ${showDeleteConfirm ? "show" : ""}`}
        style={{ display: showDeleteConfirm ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showDeleteConfirm}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className={`modal-content ${
              theme === "dark" ? "bg-dark text-light" : ""
            }`}
          >
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-trash-alt text-danger me-2"></i>
                Confirm Delete
              </h5>
              <button
                type="button"
                className={`btn-close ${
                  theme === "dark" ? "btn-close-white" : ""
                }`}
                aria-label="Close"
                onClick={() => setShowDeleteConfirm(false)}
              ></button>
            </div>
            <div className="modal-body py-4">
              <div className="d-flex align-items-center">
                <div className="text-danger me-3" style={{ fontSize: "2rem" }}>
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <p className="mb-0">
                  Are you sure you want to delete this report? This action
                  cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <i className="fas fa-times me-2"></i>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={deleteReport}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt me-2"></i>
                    Delete Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showDeleteConfirm && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowDeleteConfirm(false)}
        ></div>
      )}
    </>
  );
};

export default DeleteConfirmModal;
