import React, { useContext } from "react";
import Select from "react-select";

const EmployeeSelect = ({
  modalData,
  employeesState,
  handleEmployeeChange,
  theme = "light",
}) => {
  const formatEmployeeData = (employee) => ({
    value: employee._id ? employee._id : employee.value,
    label: `${employee.firstName} ${employee.lastName}`,
    key: employee._id ? employee._id : employee.value,
  });

  const selectedEmployees = modalData?.employees?.map(formatEmployeeData);
  const employeeOptions = employeesState.map(formatEmployeeData);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1a1d20" : provided.backgroundColor,
      borderColor: theme === "dark" ? "#343a40" : provided.borderColor,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1a1d20" : provided.backgroundColor,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor:
        theme === "dark"
          ? state.isSelected
            ? "#0d6efd"
            : state.isFocused
            ? "#343a40"
            : "#1a1d20"
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
      backgroundColor: theme === "dark" ? "#343a40" : provided.backgroundColor,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
  };

  return (
    <div className="mb-3">
      <label htmlFor="employees" className="form-label">
        Employees
      </label>
      <Select
        id="employees"
        isMulti
        value={selectedEmployees}
        onChange={handleEmployeeChange}
        options={employeeOptions}
        classNamePrefix="react-select"
        styles={customStyles}
      />
    </div>
  );
};

export default EmployeeSelect;
