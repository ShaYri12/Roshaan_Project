import React from "react";

const DynamicInput = ({ label, id, value, setValue, type = "text" }) => {
  const handleChange = (e) => {
    setValue((prevState) => ({ ...prevState, [id]: e.target.value }));
  };

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        type={type}
        id={id}
        className="form-control"
        value={value || ""}
        onChange={handleChange}
      />
    </div>
  );
};

export default DynamicInput;
