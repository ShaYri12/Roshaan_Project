import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import "bootstrap/dist/css/bootstrap.min.css";
import EmployeeSelect from "../components/EmployeeSelect";
import CarsSelect from "../components/CarsSelect";
import DynamicInput from "../components/DynamicInput";
import LocationPicker from "../components/LocationPicker";
import { authenticatedFetch } from "../utils/axiosConfig";
import Sidebar from "../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [employeesState, setEmployees] = useState([]);
  const [carsState, setCars] = useState([]);
  const [addCompanyData, setAddCompanyData] = useState({
    name: "",
    location: {
      address: "",
      lat: 0,
      lon: 0,
    },
    employees: [],
    cars: [],
  });
  const [editCompanyData, setEditCompanyData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // Add theme state
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Apply theme class to body element on mount and when theme changes
    document.body.className = `${theme}-theme`;
  }, [theme]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/companies`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });
        const data = await response.json();
        setCompanies(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchCompanies();
  }, []);

  const fetchEmployeesAndCars = async () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
    };

    try {
      const [employeeResponse, carResponse] = await Promise.all([
        fetch(`${REACT_APP_API_URL}/employees`, { method: "GET", headers }),
        fetch(`${REACT_APP_API_URL}/transportations`, {
          method: "GET",
          headers,
        }),
      ]);

      const [employeeData, carData] = await Promise.all([
        employeeResponse.json(),
        carResponse.json(),
      ]);

      setEmployees(employeeData);
      setCars(carData);

      return { employeeData, carData };
    } catch (error) {
      setError(error.message);
      return { employeeData: [], carData: [] };
    }
  };

  const handleAddSubmit = async () => {
    try {
      // Extract the address from the location object for backward compatibility
      const submissionData = {
        ...addCompanyData,
        address: addCompanyData.location?.address || "",
        lat: addCompanyData.location?.lat || 0,
        lon: addCompanyData.location?.lon || 0,
      };

      const response = await fetch(`${REACT_APP_API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Error submitting company data");
      }

      window.location.reload();
      setShowAddModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      // Extract the address from the location object for backward compatibility
      const submissionData = {
        ...editCompanyData,
        address:
          editCompanyData.location?.address || editCompanyData.address || "",
        lat: editCompanyData.location?.lat || 0,
        lon: editCompanyData.location?.lon || 0,
      };

      const response = await fetch(
        `${REACT_APP_API_URL}/companies/${editCompanyData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (!response.ok) {
        throw new Error("Error updating company data");
      }

      window.location.reload();
      setShowEditModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/companies/${companyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting company");
      }

      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company._id !== companyId)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddCompanyModel = async () => {
    try {
      await fetchEmployeesAndCars();
      setAddCompanyData({
        name: "",
        location: {
          address: "",
          lat: 0,
          lon: 0,
        },
        employees: [],
        cars: [],
      });
      setShowAddModal(true);
    } catch (error) {
      setError(error.message);
    }
  };

  // Check authentication on load and set user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        try {
          const response = await authenticatedFetch(
            `${REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
            }
          );
          if (response.ok) {
            // Set the user data
            const userObj = JSON.parse(localStorage.getItem("userObj"));
            setUserData(userObj);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            navigate("/");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    checkAuth();
    // Apply theme from localStorage
    document.body.className = `${theme}-theme`;
  }, [navigate, theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  // For Add Company modal
  const handleAddLocationChange = (location) => {
    setAddCompanyData((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleAddEmployeeChange = (employees) => {
    const updatedEmployees = employees.map((employee) => {
      const label = employee.label || "";
      const id = employee._id || "";
      const value = employee.value || id;

      // Split label into firstName and lastName
      const nameParts = label.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts[1] || "";

      return {
        value,
        firstName,
        lastName,
      };
    });

    setAddCompanyData((prev) => ({
      ...prev,
      employees: updatedEmployees,
    }));
  };

  const handleAddCarChange = (cars) => {
    const updatedCars = cars.map((car) => {
      const label = car.label || "";
      const id = car._id || "";
      const value = car.value || id;

      // Split label into firstName and lastName
      const nameParts = label.split(" ");
      const name = nameParts[0] || "";

      return {
        value,
        name,
      };
    });

    setAddCompanyData((prev) => ({
      ...prev,
      cars: updatedCars,
    }));
  };

  // For Edit Company modal
  const handleEditLocationChange = (location) => {
    setEditCompanyData((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleEditEmployeeChange = (employees) => {
    const updatedEmployees = employees.map((employee) => {
      const label = employee.label || "";
      const id = employee._id || "";
      const value = employee.value || id;

      // Split label into firstName and lastName
      const nameParts = label.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts[1] || "";

      return {
        value,
        firstName,
        lastName,
      };
    });

    setEditCompanyData((prev) => ({
      ...prev,
      employees: updatedEmployees,
    }));
  };

  const handleEditCarChange = (cars) => {
    const updatedCars = cars.map((car) => {
      const label = car.label || "";
      const id = car._id || "";
      const value = car.value || id;

      // Split label into firstName and lastName
      const nameParts = label.split(" ");
      const name = nameParts[0] || "";

      return {
        value,
        name,
      };
    });

    setEditCompanyData((prev) => ({
      ...prev,
      cars: updatedCars,
    }));
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    // Important: Also reset the edit company data when closing
    setEditCompanyData(null);
  };

  // Add a new function specifically for editing a company
  const handleEditCompany = async (company) => {
    try {
      // First fetch employees and cars
      await fetchEmployeesAndCars();

      // Transform the address into location object structure if it's a simple string
      const updatedData = { ...company };
      if (typeof updatedData.address === "string" && !updatedData.location) {
        updatedData.location = {
          address: updatedData.address || "",
          lat: updatedData.lat || 0,
          lon: updatedData.lon || 0,
        };
      }

      // Set the edit data and open the modal
      setEditCompanyData(updatedData);
      setShowEditModal(true);
    } catch (error) {
      setError(error.message);
    }
  };

  return isLoading ? (
    <div className="container py-5">
      <div className="alert alert-info" role="alert">
        Loading companies...
      </div>
    </div>
  ) : (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container mt-4">
          <h1 className="mb-4">Company Locations</h1>

          <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
              <p className="mb-0">Total: {companies.length}</p>
              <button
                className="btn btn-outline-success"
                onClick={handleAddCompanyModel}
              >
                <FaPlusCircle className="me-2" /> Add Company
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company Name</th>
                    <th>Address</th>
                    <th>Employees</th>
                    <th>Cars</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? (
                    companies.map((company, index) => (
                      <tr key={company._id}>
                        <td>{index + 1}</td>
                        <td>{company.name}</td>
                        <td>{company.address}</td>
                        <td>
                          {company.employees.length > 0
                            ? company.employees.map((employee, empIndex) => (
                                <div key={empIndex}>
                                  {employee.firstName} {employee.lastName}
                                </div>
                              ))
                            : "No employees"}
                        </td>
                        <td>
                          {company.cars.length > 0
                            ? company.cars.map((car, carIndex) => (
                                <div key={carIndex}>{car.name}</div>
                              ))
                            : "No cars"}
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditCompany(company)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCompany(company._id)}
                            >
                              <i className="fas fa-trash"></i>
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
        </div>

        {/* Add Company Modal */}
        {showAddModal && (
          <div
            className="modal show custom-scrollbar"
            tabIndex="-1"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Company</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form>
                    <DynamicInput
                      label="Company Name"
                      id="name"
                      value={addCompanyData?.name}
                      setValue={setAddCompanyData}
                    />

                    <div className="mb-4">
                      <LocationPicker
                        label="Company Address"
                        value={addCompanyData?.location}
                        onChange={handleAddLocationChange}
                        required
                        mapHeight="250px"
                        placeholder="Enter company address"
                      />
                    </div>

                    <EmployeeSelect
                      modalData={addCompanyData}
                      employeesState={employeesState}
                      handleEmployeeChange={handleAddEmployeeChange}
                      theme={theme}
                    />

                    <CarsSelect
                      modalData={addCompanyData}
                      carsState={carsState}
                      handleCarChange={handleAddCarChange}
                      theme={theme}
                    />
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddSubmit}
                  >
                    Save Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Company Modal */}
        {showEditModal && editCompanyData && (
          <div
            className="modal show custom-scrollbar"
            tabIndex="-1"
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Company</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeEditModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form>
                    <DynamicInput
                      label="Company Name"
                      id="name"
                      value={editCompanyData?.name}
                      setValue={setEditCompanyData}
                    />

                    <div className="mb-4">
                      <LocationPicker
                        label="Company Address"
                        value={editCompanyData?.location}
                        onChange={handleEditLocationChange}
                        required
                        mapHeight="250px"
                        placeholder="Enter company address"
                      />
                    </div>

                    <EmployeeSelect
                      modalData={editCompanyData}
                      employeesState={employeesState}
                      handleEmployeeChange={handleEditEmployeeChange}
                      theme={theme}
                    />

                    <CarsSelect
                      modalData={editCompanyData}
                      carsState={carsState}
                      handleCarChange={handleEditCarChange}
                      theme={theme}
                    />
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEditSubmit}
                  >
                    Update Company
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPage;
