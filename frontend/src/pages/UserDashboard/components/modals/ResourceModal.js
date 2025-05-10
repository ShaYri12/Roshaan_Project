import React, { useState, useEffect } from "react";
import Select from "react-select";

/**
 * Modal for adding a new resource
 */
const ResourceModal = ({
  visible,
  onClose,
  formData,
  emissionTypes = [],
  onChange,
  onEmissionTypeChange,
  onSubmit,
  theme,
}) => {
  // Add loading state check
  const [isSelectDisabled, setIsSelectDisabled] = useState(false);

  // Check if emission types are loaded
  useEffect(() => {
    setIsSelectDisabled(!emissionTypes || emissionTypes.length === 0);
  }, [emissionTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  if (!visible) return null;

  // Custom styles for react-select component based on theme
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#343a40" : "#ffffff",
      borderColor: theme === "dark" ? "#495057" : "#ced4da",
      color: theme === "dark" ? "#f8f9fa" : "#212529",
      boxShadow: state.isFocused
        ? `0 0 0 0.2rem ${
            theme === "dark"
              ? "rgba(13, 110, 253, 0.25)"
              : "rgba(0, 123, 255, 0.25)"
          }`
        : null,
      "&:hover": {
        borderColor: theme === "dark" ? "#0d6efd" : "#80bdff",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? theme === "dark"
          ? "#495057"
          : "#f8f9fa"
        : theme === "dark"
        ? "#343a40"
        : "white",
      color: state.isSelected
        ? "white"
        : theme === "dark"
        ? "#f8f9fa"
        : "#212529",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "#0d6efd"
          : theme === "dark"
          ? "#495057"
          : "#f0f0f0",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#343a40" : "white",
      borderColor: theme === "dark" ? "#495057" : "#ced4da",
      zIndex: 9999,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#adb5bd" : "#6c757d",
    }),
  };

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
        aria-labelledby="otherResourcesModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="otherResourcesModalLabel">
                Add New Resource
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
                  {isSelectDisabled ? (
                    <div className="alert alert-warning">
                      Loading emission types... Please wait.
                    </div>
                  ) : (
                    <Select
                      id="emissionType"
                      options={emissionTypes.map((type) => ({
                        value: type._id,
                        label: type.name,
                      }))}
                      onChange={onEmissionTypeChange}
                      styles={customStyles}
                      required
                    />
                  )}
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
                    Save Resource
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

export default ResourceModal;
