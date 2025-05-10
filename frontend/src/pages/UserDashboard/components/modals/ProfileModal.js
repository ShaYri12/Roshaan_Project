import React from "react";
import UpdateEmployee from "../../../../pages/UpdateEmployee";

/**
 * Modal for updating user profile
 */
const ProfileModal = ({ visible, onClose, userData, onUpdate }) => {
  if (!visible) return null;

  // Modal backdrop
  const modalBackdrop = (
    <div
      className="modal-backdrop fade show"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1040,
      }}
      onClick={onClose}
    ></div>
  );

  return (
    <>
      {modalBackdrop}
      <div
        className="modal fade show custom-scrollbar"
        tabIndex="-1"
        style={{ display: "block", zIndex: 1050 }}
        aria-labelledby="profileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="profileModalLabel">
                Update Profile
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <UpdateEmployee
                userData={userData}
                isModelVisible={visible}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
