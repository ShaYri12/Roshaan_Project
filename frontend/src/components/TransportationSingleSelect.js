import React from "react";
import Select from "react-select";

const TransportationSingleSelect = ({
  selectedTransportation,
  transportationsState,
  handleTransportationChange,
  theme = "light",
  label = "Transportation",
  placeholder = "Select a transportation",
  isClearable = true,
}) => {
  const formatTransportationData = (transportation) => ({
    value: transportation._id ? transportation._id : transportation.value,
    label: `${transportation.name}`,
    key: transportation._id ? transportation._id : transportation.value,
  });

  const transportationOptions = transportationsState.map(
    formatTransportationData
  );

  // Find the selected transportation in the options
  const selectedValue = selectedTransportation
    ? transportationOptions.find(
        (option) => option.value === selectedTransportation
      )
    : null;

  // Create custom styles for theming the select component
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#272b30" : provided.backgroundColor,
      borderColor: theme === "dark" ? "#272b30" : provided.borderColor,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#272b30" : provided.backgroundColor,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor:
        theme === "dark"
          ? state.isSelected
            ? "#0d6efd"
            : state.isFocused
            ? "#272b30"
            : "#272b30"
          : provided.backgroundColor,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#adb5bd" : provided.color,
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#272b30" : provided.backgroundColor,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
  };

  return (
    <div className="mb-3">
      <label htmlFor="transportation" className="form-label">
        {label}
      </label>
      <Select
        id="transportation"
        isMulti={false}
        isClearable={isClearable}
        value={selectedValue}
        onChange={handleTransportationChange}
        options={transportationOptions}
        classNamePrefix="react-select"
        styles={customStyles}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TransportationSingleSelect;
