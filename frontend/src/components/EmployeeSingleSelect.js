import React from "react";
import Select from "react-select";

const EmployeeSingleSelect = ({
  selectedEmployee,
  employeesState,
  handleEmployeeChange,
  theme = "light",
  label = "Employee",
  placeholder = "Select an employee",
  isClearable = true,
}) => {
  const formatEmployeeData = (employee) => ({
    value: employee._id ? employee._id : employee.value,
    label: `${employee.firstName} ${employee.lastName}`,
    key: employee._id ? employee._id : employee.value,
  });

  const employeeOptions = employeesState.map(formatEmployeeData);

  // Find the selected employee in the options
  const selectedValue = selectedEmployee
    ? employeeOptions.find((option) => option.value === selectedEmployee)
    : null;

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
      <label htmlFor="employee" className="form-label">
        {label}
      </label>
      <Select
        id="employee"
        isMulti={false}
        isClearable={isClearable}
        value={selectedValue}
        onChange={handleEmployeeChange}
        options={employeeOptions}
        classNamePrefix="react-select"
        styles={customStyles}
        placeholder={placeholder}
      />
    </div>
  );
};

export default EmployeeSingleSelect;
