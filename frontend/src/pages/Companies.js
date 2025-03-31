import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaHome } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import EmployeeSelect from "../components/EmployeeSelect";
import CarsSelect from "../components/CarsSelect";
import DynamicInput from "../components/DynamicInput";
import LocationPicker from "../components/LocationPicker";

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [employeesState, setEmployees] = useState([]);
  const [carsState, setCars] = useState([]);
  const [modalData, setModalData] = useState(null); // Ensure modalData starts as null
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light"); // Add theme state

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

  useEffect(() => {
    if (modalData) {
      fetchEmployeesAndCars(modalData);
    }
  }, [modalData]);

  const fetchEmployeesAndCars = async (data) => {
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

      // Transform the address into location object structure if it's a simple string
      const updatedData = { ...data };
      if (typeof updatedData.address === "string" && !updatedData.location) {
        updatedData.location = {
          address: updatedData.address || "",
          lat: updatedData.lat || 0,
          lon: updatedData.lon || 0,
        };
      }

      setModalData(updatedData);
      setShowModal(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleModalSubmit = async () => {
    const method = modalData?._id ? "PUT" : "POST";
    const url = modalData?._id
      ? `${REACT_APP_API_URL}/companies/${modalData._id}`
      : `${REACT_APP_API_URL}/companies`;

    try {
      // Extract the address from the location object for backward compatibility
      const submissionData = {
        ...modalData,
        address: modalData.location?.address || modalData.address || "",
        lat: modalData.location?.lat || 0,
        lon: modalData.location?.lon || 0,
      };

      const response = await fetch(url, {
        method,
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
      setShowModal(false);
      setModalData(null); // Reset modalData after submission
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

  const handleAddCompanyModel = () => {
    setModalData({
      name: "",
      location: {
        address: "",
        lat: 0,
        lon: 0,
      },
      employees: [],
      cars: [],
    });
    setShowModal(true);
  };

  const handleLocationChange = (location) => {
    setModalData((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleEmployeeChange = (employees) => {
    const updatedEmployees = employees.map((employee) => {
      const label = employee.label || ""; // Use label if available, or default to an empty string
      const id = employee._id || ""; // Old records have id, fallback to empty string
      const value = employee.value || id; // Use value if available, fallback to id

      // Split label into firstName and lastName
      const nameParts = label.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts[1] || "";

      return {
        value, // Unified field for both old and new records
        firstName,
        lastName,
      };
    });

    setModalData((prevModalData) => ({
      ...prevModalData,
      employees: updatedEmployees,
    }));
  };

  const handleCarChange = (cars) => {
    const updatedCars = cars.map((car) => {
      const label = car.label || ""; // Use label if available, or default to an empty string
      const id = car._id || ""; // Old records have id, fallback to empty string
      const value = car.value || id; // Use value if available, fallback to id

      // Split label into firstName and lastName
      const nameParts = label.split(" ");
      const name = nameParts[0] || "";

      return {
        value,
        name,
      };
    });

    setModalData((prevModalData) => ({
      ...prevModalData,
      cars: updatedCars,
    }));
  };

  return isLoading ? (
    <div className="container py-5">
      <div className="alert alert-info" role="alert">
        Loading companies...
      </div>
    </div>
  ) : (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <div className="d-flex align-items-center justify-content-center">
            <i className="fas fa-building fa-2x me-3"></i>
            <h4 className="card-title mb-0">Company Locations</h4>
          </div>
          <span>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/dashboard")}
            >
              <FaHome className="me-2" /> Home
            </button>
          </span>
        </div>
      </nav>

      <div className="container-fluid py-5">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
          <p className="mb-0">Total: {companies.length}</p>
          <button
            className="btn btn-outline-success"
            onClick={handleAddCompanyModel}
          >
            Add Company
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
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => fetchEmployeesAndCars(company)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCompany(company._id)}
                      >
                        Delete
                      </button>
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

      {showModal && (
        <div
          className="modal show custom-scrollbar"
          tabIndex="-1"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalData?._id ? "Update Company" : "Add Company"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <DynamicInput
                    label="Company Name"
                    id="name"
                    value={modalData?.name}
                    setValue={setModalData}
                  />

                  <div className="mb-4">
                    <LocationPicker
                      label="Company Address"
                      value={modalData?.location}
                      onChange={handleLocationChange}
                      required
                      mapHeight="250px"
                      placeholder="Enter company address"
                    />
                  </div>

                  <EmployeeSelect
                    modalData={modalData}
                    employeesState={employeesState}
                    handleEmployeeChange={handleEmployeeChange}
                    theme={theme}
                  />

                  <CarsSelect
                    modalData={modalData}
                    carsState={carsState}
                    handleCarChange={handleCarChange}
                    theme={theme}
                  />
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleModalSubmit}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
