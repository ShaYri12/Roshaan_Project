import { useState, useEffect } from "react";
import axios from "axios";
const dotEnv = process.env;

const useEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${dotEnv.REACT_APP_API_URL}/employees`);
      setEmployees(response.data);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new employee
  const createEmployee = async (employeeData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${dotEnv.REACT_APP_API_URL}/employees`,
        employeeData
      );
      setEmployees([...employees, response.data]);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Update an employee
  const updateEmployee = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${dotEnv.REACT_APP_API_URL}/employees/${id}`,
        updatedData
      );
      setEmployees(
        employees.map((emp) => (emp._id === id ? response.data : emp))
      );
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${dotEnv.REACT_APP_API_URL}/employees/${id}`);
      setEmployees(employees.filter((emp) => emp._id !== id));
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    error,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};

export default useEmployee;
