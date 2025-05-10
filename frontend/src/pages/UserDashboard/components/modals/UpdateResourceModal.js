import React from "react";

/**
 * Modal for updating an existing resource
 */
const UpdateResourceModal = ({
  visible,
  onClose,
  formData,
  emissionTypes,
  onChange,
  onSubmit,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

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
        aria-labelledby="updateResourceModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="updateResourceModalLabel">
                Update Resource
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="emissionType" className="form-label">
                    Emission Type
                  </label>
                  <select
                    id="emissionType"
                    className="form-control"
                    value={formData.emissionType || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "emissionType",
                          value: e.target.value,
                        },
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select Emission Type
                    </option>
                    {emissionTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="co2Equivalent" className="form-label">
                    CO₂ Equivalent
                  </label>
                  <input
                    type="number"
                    id="co2Equivalent"
                    className="form-control"
                    name="co2Equivalent"
                    value={formData.co2Equivalent}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-success">
                    Update Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateResourceModal;
