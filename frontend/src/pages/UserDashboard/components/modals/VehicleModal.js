import React from "react";
import VehicleRegisterPage from "../../../../pages/VehicleRegister";

/**
 * Modal for vehicle registration
 */
const VehicleModal = ({ visible, onClose }) => {
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
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Vehicle Registration
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <VehicleRegisterPage
                userData={visible}
                isModalVisible={visible}
                isAdmin={true}
                onSuccess={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleModal;
