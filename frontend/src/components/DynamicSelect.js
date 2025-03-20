import React from "react";
import Select from "react-select";
import { Modal, Button, Form } from "react-bootstrap";

const DynamicSelect = ({
  label,
  id,
  modalData,
  stateData,
  handleChange,
  formatData,
  isMulti = false,
}) => {
  const options =
    stateData && Array.isArray(stateData) ? stateData.map(formatData) : [];

  const selectedValue = modalData ? modalData[id] : null;

  const selectedOptions = isMulti
    ? options.filter((opt) => selectedValue?.includes(opt.value))
    : options.find((opt) => opt.value === selectedValue);

  return (
    <Form.Group controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Select
        isMulti={isMulti}
        options={options}
        value={selectedOptions}
        onChange={handleChange}
      />
    </Form.Group>
  );
};

export default DynamicSelect;
