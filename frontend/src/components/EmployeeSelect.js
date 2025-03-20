import React from "react";
import Select from "react-select";

const EmployeeSelect = ({
  modalData,
  employeesState,
  handleEmployeeChange,
}) => {
  const formatEmployeeData = (employee) => ({
    value: employee._id ? employee._id : employee.value,
    label: `${employee.firstName} ${employee.lastName}`,
    key: employee._id ? employee._id : employee.value,
  });

  const selectedEmployees = modalData?.employees?.map(formatEmployeeData);
  const employeeOptions = employeesState.map(formatEmployeeData);

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
      />
    </div>
  );
};

export default EmployeeSelect;
