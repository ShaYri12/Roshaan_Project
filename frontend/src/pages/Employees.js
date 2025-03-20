import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import "bootstrap/dist/css/bootstrap.min.css";
import UpdateEmployee from "./UpdateEmployee";
import Registration from "./Registration";
import { FaHome, FaPlusCircle, FaUserPlus } from "react-icons/fa"; // Import FaPlusCircle here

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null); // Store the employee to be edited
  const navigate = useNavigate();

  // Function to fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/employees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch employees data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Delete employee function
  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/employees/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (response.ok) {
          setEmployees(employees.filter((employee) => employee._id !== id));
        } else {
          throw new Error("Failed to delete employee");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };
  const employeeDetails = async (id) => {
    navigate(`/employee-details/${id}`);
  };

  // Edit employee function
  const editEmployee = (user) => {
    console.log("Edit employee", user);
    setModalVisible(user); // Set the selected employee to be edited
  };

  // Register employee function
  const regEmployee = (e) => {
    console.log("Reg employee");
    setIsRegModel(e);
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false); // Close the modal by resetting the state
    setIsRegModel(false);
  };

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          Loading employees...
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedData) => {
    localStorage.setItem("userObj", JSON.stringify(updatedData));
    window.location.reload();
  };

  return (
    <div>
      {/* Navbar with Home Icon */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <span className="navbar-brand">
            <div className="card-header d-flex align-items-center">
              <i className="fas fa-users fa-1x me-3"></i>
              <h4 className="card-title mb-0">Employees</h4>
            </div>
          </span>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome className="me-2" /> Home
          </button>
        </div>
      </nav>

      {/* Employee Listing Table */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
          <p className="mb-0">Total: {employees.length}</p>
          <button
            className="btn btn-outline-success d-flex align-items-center px-4 py-1 rounded-3 shadow-sm hover-shadow mb-0"
            onClick={() => regEmployee(true)}
            style={{ marginBottom: "13px" }}
          >
            <FaUserPlus className="me-2" />
            Register Employee
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Home Address</th>
                <th>Company Address</th>
                <th>Transportation Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee, index) => (
                  <tr key={employee._id}>
                    <td>{index + 1}</td>
                    <td>{`${employee.firstName} ${employee.lastName}`}</td>
                    <td>{employee.homeAddress}</td>
                    <td>{employee.companyAddress}</td>
                    <td>{employee.car?.name || "N/A"}</td>
                    <td className="">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => editEmployee(employee)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteEmployee(employee._id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => employeeDetails(employee._id)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Update Modal */}
      {isModalVisible && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Update Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <UpdateEmployee
                  userData={isModalVisible}
                  isModalVisible={isModalVisible}
                  onUpdate={(updatedData) => handleProfileUpdate(updatedData)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Profile Modal */}
      {isRegModel && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Employee Registration
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <Registration
                  userData={isRegModel}
                  isModalVisible={false}
                  isAdmin={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
