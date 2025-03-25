import React from "react";
import { Form } from "react-bootstrap";

const DynamicSelect = ({
  label,
  id,
  modalData,
  stateData,
  handleChange,
  formatData,
  isMulti = false,
}) => {
  // Format data for regular select
  const options =
    stateData && Array.isArray(stateData) ? stateData.map(formatData) : [];

  // Get the current value - either directly from modalData or default to empty string
  const currentValue = modalData && modalData[id] ? modalData[id] : "";

  // Handle change for the select
  const onSelectChange = (e) => {
    // Create a synthetic event similar to what react-select would provide
    const selectedOption = options.find((opt) => opt.value === e.target.value);
    handleChange(selectedOption, { name: id, action: "select-option" });
  };

  return (
    <Form.Group controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        className="form-select"
        value={currentValue}
        onChange={onSelectChange}
        aria-label={`Select ${label}`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default DynamicSelect;
