import React, { useState } from "react";
import { saveWorkTransportationRecord } from "../../utils/transportUtils";

/**
 * Modal for adding a new work transportation record
 */
const WorkTransportationModal = ({
  visible,
  onClose,
  formData,
  onChange,
  transportOptions = [],
  onSubmitSuccess,
}) => {
  // Add state for error messages
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error message
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.carType) {
        throw new Error("Please select a car type");
      }

      if (!formData.date) {
        throw new Error("Please select a date");
      }

      if (!formData.usageType) {
        throw new Error("Please select a usage type");
      }

      // Submit the record
      await saveWorkTransportationRecord(formData);
      console.log("Work transportation record saved!");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Error saving work transportation record:", error);
      setError(
        error.message ||
          "Failed to save work transportation record. Please try again."
      );
      // Scroll to top of modal to show error
      const modalBody = document.querySelector(".modal-body");
      if (modalBody) modalBody.scrollTop = 0;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to close modal and reset error state
  const handleClose = () => {
    setError("");
    onClose();
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
      onClick={handleClose}
    ></div>
  );

  return (
    <>
      {modalBackdrop}
      <div
        className="modal fade show custom-scrollbar"
        tabIndex="-1"
        style={{ display: "block", zIndex: 1050 }}
        aria-labelledby="extraTransportationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="extraTransportationModalLabel">
                Add New Work Transportation Record
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Display error message if there is one */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="carType" className="form-label">
                    Choose Car Type*
                  </label>
                  <select
                    id="carType"
                    className="form-select"
                    name="carType"
                    value={formData.carType || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "carType",
                          value: e.target.value,
                        },
                      })
                    }
                    required
                  >
                    <option value="">Select...</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="gasoline">Gasoline</option>
                    <option value="average">Average</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="cars" className="form-label">
                    Select Transport
                  </label>
                  <select
                    id="cars"
                    className="form-select"
                    name="transport"
                    value={formData.transport || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "transport",
                          value: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {transportOptions.map((option) => (
                      <option
                        key={option._id || option.value}
                        value={option._id || option.value}
                      >
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="co2Emission" className="form-label">
                    CO₂ Emission per km
                  </label>
                  <input
                    type="number"
                    id="co2Emission"
                    className="form-control"
                    name="co2Emission"
                    value={formData.co2Emission || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "co2Emission",
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="usageType" className="form-label">
                    Usage Type*
                  </label>
                  <select
                    id="usageType"
                    className="form-select"
                    name="usageType"
                    value={formData.usageType || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "usageType",
                          value: e.target.value,
                        },
                      })
                    }
                    required
                  >
                    <option value="">Select...</option>
                    <option value="company car">Company Car</option>
                    <option value="business travel">Business Travel</option>
                    <option value="commuting">Commuting</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="workFromHomeDays" className="form-label">
                    Work from Home Days (Per Week)
                  </label>
                  <input
                    type="number"
                    id="workFromHomeDays"
                    className="form-control"
                    name="workFromHomeDays"
                    value={formData.workFromHomeDays || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "workFromHomeDays",
                          value: e.target.value,
                        },
                      })
                    }
                    min="0"
                    max="7"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="recurrenceDays" className="form-label">
                    Recurring Days
                  </label>
                  <select
                    id="recurrenceDays"
                    className="form-select"
                    name="recurrenceDays"
                    value={formData.recurrenceDays || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "recurrenceDays",
                          value: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days</option>
                    <option value="4">4 Days</option>
                    <option value="5">5 Days</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="date" className="form-label">
                    Date*
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="form-control"
                    name="date"
                    value={formData.date || ""}
                    onChange={(e) =>
                      onChange({
                        target: {
                          name: "date",
                          value: e.target.value,
                        },
                      })
                    }
                    required
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Save Work Transport Record"
                    )}
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

export default WorkTransportationModal;
