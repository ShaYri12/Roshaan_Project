import React from "react";
import Select from "react-select";

const CarsSelect = ({
  modalData,
  carsState,
  handleCarChange,
  theme = "light",
}) => {
  const formatCarData = (car) => {
    // Make sure we have valid data
    if (!car) return null;

    return {
      value: car._id ? car._id : car.value,
      label: car.name ? `${car.name}` : car.label || "",
      key: car._id ? car._id : car.value,
    };
  };

  // Filter out any null values from the formatted data
  const selectedCars = modalData?.cars?.map(formatCarData).filter(Boolean);

  const carOptions = carsState.map(formatCarData);

  console.log("CarsSelect - Selected:", selectedCars);
  console.log("CarsSelect - Options:", carOptions);

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
      <label htmlFor="cars" className="form-label">
        Transportation's
      </label>
      <Select
        id="cars"
        isMulti
        value={selectedCars}
        onChange={handleCarChange}
        options={carOptions}
        classNamePrefix="react-select"
        styles={customStyles}
      />
    </div>
  );
};

export default CarsSelect;
