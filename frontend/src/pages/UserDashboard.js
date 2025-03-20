import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  JWT_ADMIN_SECRET,
  JWT_EMPLOYEE_SECRET,
  REACT_APP_API_URL,
} from "../env";
import UpdateEmployee from "./UpdateEmployee";
import Select from "react-select";
import TransportEmissions from "./TransportEmissions";
import { FaArrowLeft, FaPlusCircle } from "react-icons/fa";
import VehicleRegisterPage from "./VehicleRegister";

const DashboardPage = () => {
  const { id } = useParams(); // Extract ID from URL
  const navigate = useNavigate();

  // Move theme state definition before customStyles
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [employeeId, setEmployeeId] = useState(id ?? null);

  // Now customStyles can properly reference theme
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#343a40" : "#ffffff",
      borderColor: theme === "dark" ? "#495057" : "#ced4da",
      color: theme === "dark" ? "#f8f9fa" : "#212529",
      boxShadow: state.isFocused
        ? `0 0 0 0.2rem ${
            theme === "dark"
              ? "rgba(13, 110, 253, 0.25)"
              : "rgba(0, 123, 255, 0.25)"
          }`
        : null,
      "&:hover": {
        borderColor: theme === "dark" ? "#0d6efd" : "#80bdff",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? theme === "dark"
          ? "#495057"
          : "#f8f9fa"
        : theme === "dark"
        ? "#343a40"
        : "white",
      color: state.isSelected
        ? "white"
        : theme === "dark"
        ? "#f8f9fa"
        : "#212529",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "#0d6efd"
          : theme === "dark"
          ? "#495057"
          : "#f0f0f0",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#343a40" : "white",
      borderColor: theme === "dark" ? "#495057" : "#ced4da",
      zIndex: 9999,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#f8f9fa" : "#212529",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#adb5bd" : "#6c757d",
    }),
  };

  const [userData, setUserData] = useState(null);
  const [transport, setTransport] = useState([]);
  const [isTransportationModalVisible, setIsTransportationModalVisible] =
    useState(false);
  const [
    isWorkTransportationModalVisible,
    setIsWorkTransportationModalVisible,
  ] = useState(false);
  const [activeTab, setActiveTab] = useState("transport");
  const [employeeTransportationData, setEmployeeTransportationData] = useState({
    transportationMode: "car",
    beginLocation: "",
    endLocation: "",
    date: "",
    recurring: false,
    employeeId: "",
  });
  const [employeeWorkTransportationData, setEmployeeWorkTransportationData] =
    useState({});
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [globalTransportationData, setGlobalTransportationData] = useState([]);
  const [employeeTransListing, setEmployeeTransListing] = useState([]);
  const [filterType, setFilterType] = useState("self");
  const [workTransportationData, setWorkTransportationData] = useState([]);
  const [globalWorkTransportationData, setGlobalWorkTransportationData] =
    useState([]);
  const [otherResources, setOtherResources] = useState([]);
  const [isOtherResourcesModalVisible, setIsOtherResourcesModalVisible] =
    useState(false);
  const [newResourceData, setNewResourceData] = useState({
    emissionType: "",
    quantity: "",
    co2Equivalent: "",
    date: "",
  });
  const [emissionTypes, setEmissionTypes] = useState([]);
  const [conversionFactor, setConversionFactor] = useState(0);
  const [isUpdateResourceModalVisible, setIsUpdateResourceModalVisible] =
    useState(false);
  const [updateResourceData, setUpdateResourceData] = useState({
    emissionType: "",
    quantity: "",
    co2Equivalent: "",
    date: "",
  });
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const toggleFavorite = async (vehicleId, index) => {
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/vehicles/${vehicleId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_EMPLOYEE_SECRET}`, // Include token for authentication
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark favorite");
      }

      const data = await response.json();
      console.log("Favorite updated:", data);

      // ✅ Update state locally after successful API response
      setVehicles((prevVehicles) => {
        const updatedVehicles = [...prevVehicles];
        updatedVehicles[index] = {
          ...updatedVehicles[index],
          isFavorite: data.vehicle.isFavorite,
        };
        return updatedVehicles;
      });
    } catch (err) {
      console.error("Error marking favorite:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      // ✅ Get the user ID from localStorage
      const storedUserData = localStorage.getItem("userObj");
      const userData = storedUserData ? JSON.parse(storedUserData) : null;
      const userId = userData?._id; // Ensure this exists

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await fetch(
        `${REACT_APP_API_URL}/vehicles?owner=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, []);
  const regVehicle = (e) => {
    setIsRegModel(e);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsRegModel(false);
  };
  useEffect(() => {
    const handleFetchRecords = async () => {
      try {
        // Parse user object from localStorage
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (!userObj || !userObj._id) {
          console.error("User object not found or invalid in localStorage");
          return;
        }

        // Fetch transportation records
        const response = await fetch(
          `${REACT_APP_API_URL}/employeeTransportations`
        );

        if (!response.ok) {
          throw new Error(`Error fetching records: ${response.statusText}`);
        }

        const records = await response.json();
        // Filter records for the logged-in user
        const filteredRecords = records.data.filter((record) =>
          employeeId
            ? record?.employeeId === employeeId
            : record?.employeeId === userObj._id
        );

        // Update state with filtered records
        setEmployeeTransListing(filteredRecords);
        setGlobalTransportationData(records?.data);
      } catch (error) {
        console.error(
          "Error in fetching or filtering transportation records:",
          error
        );
        setEmployeeTransListing([]); // Reset data on error
      }
    };

    handleFetchRecords();
  }, []);

  useEffect(() => {
    const handleFetchWorkRecords = async () => {
      try {
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (!userObj || !userObj._id) {
          console.error("User object not found or invalid in localStorage");
          return;
        }

        const response = await fetch(
          `${REACT_APP_API_URL}/employeeWorkTransportations`
        );
        if (!response.ok) {
          throw new Error(`Error fetching records: ${response.statusText}`);
        }

        const records = await response.json();
        const filteredRecords = records.data.filter((record) =>
          employeeId
            ? record?.employeeId === employeeId
            : record?.employeeId === userObj._id
        );

        setWorkTransportationData(filteredRecords);
        setGlobalWorkTransportationData(records?.data);
      } catch (error) {
        console.error(
          "Error in fetching or filtering work transportation records:",
          error
        );
        setWorkTransportationData([]);
      }
    };

    handleFetchWorkRecords();
  }, []);

  useEffect(() => {
    try {
      if (!filterType) {
        console.error("Invalid filter type provided.");
        return;
      }

      if (filterType === "global") {
        if (activeTab === "transport") {
          setEmployeeTransListing(globalTransportationData || []);
        } else {
          setWorkTransportationData(globalWorkTransportationData || []);
        }
      } else {
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (activeTab === "transport") {
          const filteredRecords = globalTransportationData.filter((record) =>
            employeeId
              ? record?.employeeId === employeeId
              : record?.employeeId === userObj._id
          );
          setEmployeeTransListing(filteredRecords);
        } else {
          const filteredRecords = globalWorkTransportationData.filter(
            (record) =>
              employeeId
                ? record?.employeeId === employeeId
                : record?.employeeId === userObj._id
          );
          setWorkTransportationData(filteredRecords);
        }
      }
    } catch (error) {
      console.error("Error in handling transportation records:", error);
    }
  }, [
    filterType,
    activeTab,
    globalTransportationData,
    globalWorkTransportationData,
  ]);

  useEffect(() => {
    const fetchTransport = async () => {
      const response = await fetch(`${REACT_APP_API_URL}/transportations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      const records = await response.json();
      setTransport(records);
    };
    fetchTransport();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (token && userObj) {
          setUserData(userObj);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchOtherResources = async () => {
      try {
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (!userObj || !userObj._id) {
          console.error("User object not found or invalid in localStorage");
          return;
        }

        const response = await axios.get(
          `${REACT_APP_API_URL}/user-emissions/${
            employeeId ? employeeId : userObj._id
          }`
        );

        if (response.status === 200) {
          setOtherResources(response.data);
        } else {
          throw new Error("Failed to fetch other resources.");
        }
      } catch (error) {
        console.error("Error fetching other resources:", error);
      }
    };

    if (activeTab === "otherResources") {
      fetchOtherResources();
    }
  }, [activeTab, filterType]);

  useEffect(() => {
    const fetchEmissionTypes = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_API_URL}/emission-types`,
          {
            headers: {
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
            },
          }
        );
        setEmissionTypes(response.data);
      } catch (error) {
        console.error("Error fetching emission types:", error);
      }
    };

    fetchEmissionTypes();
  }, []);

  const handleChange = (e) => {
    console.log(e);
    const { name, value, type, checked } = e.target;
    setEmployeeTransportationData((prevData) => {
      if (type === "checkbox") {
        return { ...prevData, [name]: checked };
      }
      return { ...prevData, [name]: value };
    });
  };

  const handleEmpTransSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/employeeTransportations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
          body: JSON.stringify(employeeTransportationData),
        }
      );

      if (response.ok) {
        console.log("Transportation record saved!");
        window.location.reload();
      } else {
        throw new Error("Failed to save transportation record?.");
      }
    } catch (error) {
      console.error("Error saving transportation record:", error);
    }
  };

  const handleWorkTransSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/employeeWorkTransportations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
          body: JSON.stringify(employeeWorkTransportationData),
        }
      );

      if (response.ok) {
        console.log("Work transportation record saved!");
        window.location.reload();
      } else {
        throw new Error("Failed to save work transportation record.");
      }
    } catch (error) {
      console.error("Error saving work transportation record:", error);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`; // Apply theme class to body
  };

  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);

  const handleAddNewTransport = () => {
    const userObj = JSON.parse(localStorage.getItem("userObj")); // Parse the stored JSON object

    if (!userObj) {
      console.error("User object not found in localStorage");
      return;
    }
    setEmployeeTransportationData((prev) => ({
      ...prev,
      beginLocation: userObj?.homeAddress,
      endLocation: userObj?.companyAddress,
      employeeId: employeeId ? employeeId : userObj._id,
    }));
    setIsTransportationModalVisible(true);
  };
  const handleAddNewWorkTransport = () => {
    const userObj = JSON.parse(localStorage.getItem("userObj")); // Parse the stored JSON object

    if (!userObj) {
      console.error("User object not found in localStorage");
      return;
    }
    setEmployeeWorkTransportationData((prev) => ({
      employeeId: userObj?._id,
    }));
    setIsWorkTransportationModalVisible(true);
  };

  const handleProfileUpdate = (updatedData) => {
    localStorage.setItem("userObj", JSON.stringify(updatedData));
    window.location.reload();
  };

  const handleAddOtherResource = () => {
    setIsOtherResourcesModalVisible(true);
  };

  const handleNewResourceChange = (e) => {
    const { name, value } = e.target;
    setNewResourceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "quantity") {
      setNewResourceData((prevData) => ({
        ...prevData,
        co2Equivalent: value * conversionFactor,
      }));
    }
  };

  const handleEmissionTypeChange = (selectedOption) => {
    const selectedEmissionType = emissionTypes.find(
      (type) => type._id === selectedOption.value
    );
    setConversionFactor(selectedEmissionType.conversionFactor);
    setNewResourceData((prevData) => ({
      ...prevData,
      emissionType: selectedOption.value,
      co2Equivalent: prevData.quantity * selectedEmissionType.conversionFactor,
    }));
  };

  const handleNewResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      const userObj = JSON.parse(localStorage.getItem("userObj"));
      const response = await axios.post(
        `${REACT_APP_API_URL}/user-emissions`,
        {
          ...newResourceData,
          userId: employeeId ? employeeId : userObj._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (response.status === 201) {
        console.log("Resource added successfully!");
        setIsOtherResourcesModalVisible(false);
        setNewResourceData({
          emissionType: "",
          quantity: "",
          co2Equivalent: "",
        });
        window.location.reload();
      } else {
        throw new Error("Failed to add resource.");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const handleUpdateResourceChange = (e) => {
    const { name, value } = e.target;
    setUpdateResourceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "quantity") {
      setUpdateResourceData((prevData) => ({
        ...prevData,
        co2Equivalent: value * conversionFactor,
      }));
    }
  };

  const handleUpdateResourceSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${REACT_APP_API_URL}/user-emissions/${selectedResourceId}`,
        {
          ...updateResourceData,
          co2Equivalent: updateResourceData.quantity * conversionFactor,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Resource updated successfully!");
        setIsUpdateResourceModalVisible(false);
        setUpdateResourceData({
          emissionType: "",
          quantity: "",
          co2Equivalent: "",
          date: "",
        });
        window.location.reload();
      } else {
        throw new Error("Failed to update resource.");
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const handleEditResource = (resource) => {
    setSelectedResourceId(resource?._id);
    setUpdateResourceData({
      emissionType: resource.emissionType?._id,
      quantity: resource.quantity,
      co2Equivalent: resource.co2Equivalent,
      date: new Date(resource.date).toISOString().split("T")[0],
    });
    setConversionFactor(resource.emissionType?.conversionFactor || 0);
    setIsUpdateResourceModalVisible(true);
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      const response = await axios.delete(
        `${REACT_APP_API_URL}/user-emissions/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Resource deleted successfully!");
        window.location.reload();
      } else {
        throw new Error("Failed to delete resource.");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  return (
    <div className={`dashboard-container`}>
      <nav className={`navbar navbar-expand-lg mb-4`}>
        <div className="container-fluid px-3">
          {employeeId ? (
            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn btn-outline-secondary d-flex align-items-center px-4 py-2 rounded-3 shadow-sm"
                onClick={() => navigate("/employees")}
              >
                <FaArrowLeft className="me-2" />
                Back to Employees
              </button>
            </div>
          ) : (
            <span className="navbar-brand d-flex align-items-center">
              <i className="fas fa-hand-peace me-2"></i>
              <div>
                <span
                  className="d-block"
                  style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                >
                  Welcome,{" "}
                  <span className="text-primary">
                    {userData?.firstName} {userData?.lastName}
                  </span>
                </span>
                <span
                  className="d-block"
                  style={{ fontSize: "0.9rem", fontStyle: "italic" }}
                >
                  It's a great day to be productive! ✨
                </span>
              </div>
            </span>
          )}
          <div className="container-fluid mt-3 p-0">
            <div className="row justify-content-between align-items-center w-100 gap-3">
              <div className="col-auto">
                <div className="d-flex flex-wrap btn-group-spacing gap-2">
                  <button
                    className="btn btn-outline-primary mb-0 me-0"
                    onClick={() => handleAddNewTransport()}
                  >
                    <i className="fas fa-car me-1"></i> Add New Transport
                  </button>
                  <button
                    className="btn btn-outline-primary mb-0 me-0"
                    onClick={() => handleAddNewWorkTransport()}
                  >
                    <i className="fas fa-car me-1"></i> Add New Work Transport
                  </button>
                  <button
                    className="btn btn-outline-primary mb-0 me-0"
                    onClick={() => regVehicle(true)}
                  >
                    <FaPlusCircle className="me-1" />
                    Register Vehicle
                  </button>
                  <button
                    className="btn btn-outline-primary mb-0 me-0"
                    onClick={handleAddOtherResource}
                  >
                    <i className="fas fa-plus me-1"></i> Add Other Resource
                  </button>

                  <button
                    className="btn btn-outline-primary mb-0 me-0"
                    onClick={() => setIsProfileModalVisible(true)}
                  >
                    <i className="fas fa-user-edit me-1"></i> Profile
                  </button>
                </div>
              </div>

              <div className="col-auto">
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${
                      theme === "light"
                        ? "btn-outline-dark"
                        : "btn-outline-light"
                    } theme-toggle-btn`}
                    onClick={handleThemeToggle}
                    aria-label="Toggle theme"
                  >
                    {theme === "light" ? (
                      <i className="fas fa-moon"></i> // Moon icon for Dark Mode
                    ) : (
                      <i className="fas fa-sun"></i> // Sun icon for Light Mode
                    )}
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => navigate("/")}
                  >
                    <i className="fas fa-sign-out-alt me-1"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isProfileModalVisible && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsProfileModalVisible(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <UpdateEmployee
                  userData={userData}
                  isModelVisible={true}
                  onUpdate={(updatedData) => handleProfileUpdate(updatedData)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsProfileModalVisible(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container-fluid px-3">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "transport" ? "active" : ""
              }`}
              onClick={() => setActiveTab("transport")}
            >
              <i className="fas fa-car me-1"></i> Transport
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "workTransport" ? "active" : ""
              }`}
              onClick={() => setActiveTab("workTransport")}
            >
              <i className="fas fa-building me-1"></i> Work Transport
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "otherResources" ? "active" : ""
              }`}
              onClick={() => setActiveTab("otherResources")}
            >
              <i className="fas fa-leaf me-1"></i> Other Resources
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "TransportEmissions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("TransportEmissions")}
            >
              <i className="fas fa-chart-line me-1"></i> Monthly Transport
              Emissions
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "Manage Vehicles" ? "active" : ""
              }`}
              onClick={() => setActiveTab("Manage Vehicles")}
            >
              <i className="fas fa-car-alt me-1"></i> Manage Vehicles
            </button>
          </li>
        </ul>
      </div>
      {activeTab === "transport" && (
        <div className="container-fluid mt-4 px-3">
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
            <h4 className="text-primary mb-0">Transportation Records</h4>
            <div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter records"
              >
                <option value="self">Show My Records</option>
                <option value="global">Show All Records (Global)</option>
              </select>
            </div>
          </div>

          <div className="table-responsive shadow-sm rounded">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" width="5%">
                    #
                  </th>
                  <th scope="col">Transportation Mode</th>
                  <th scope="col">Begin Address</th>
                  <th scope="col">End Address</th>
                  <th scope="col">Date</th>
                  <th scope="col" width="10%">
                    Recurring
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeTransListing?.length > 0 ? (
                  employeeTransListing?.map((record, index) => (
                    <tr key={record?._id}>
                      <td>{index + 1}</td>
                      <td>{record?.transportationMode}</td>
                      <td>{record?.beginLocation}</td>
                      <td>{record?.endLocation}</td>
                      <td>{new Date(record?.date).toLocaleDateString()}</td>
                      <td>{record?.recurring ? "Yes" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "workTransport" && (
        <div className="container-fluid mt-4 px-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h4 className="text-primary mb-0">Work Transportation Records</h4>
            <div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter records"
              >
                <option value="self">Show My Records</option>
                <option value="global">Show All Records (Global)</option>
              </select>
            </div>
          </div>

          <div className="table-responsive shadow-sm rounded">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" width="5%">
                    #
                  </th>
                  <th scope="col">Car Type</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">CO₂ Emission</th>
                  <th scope="col">Usage Type</th>
                  <th scope="col">Work From Home Days</th>
                  <th scope="col">Recurring Days</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {workTransportationData?.length > 0 ? (
                  workTransportationData?.map((record, index) => (
                    <tr key={record?._id}>
                      <td>{index + 1}</td>
                      <td>{record?.carType}</td>
                      <td>{record?.transport.name}</td>
                      <td>{record?.co2Emission}</td>
                      <td>{record?.usageType}</td>
                      <td>{record?.workFromHomeDays}</td>
                      <td>{record?.recurrenceDays}</td>
                      <td>
                        {record?.date
                          ? new Date(record?.date).toLocaleDateString()
                          : ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "otherResources" && (
        <div className="container-fluid mt-4 px-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h4 className="text-primary mb-0">Other Resources</h4>
            <div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter resources"
              >
                <option value="self">Show My Records</option>
                <option value="global">Show All Records (Global)</option>
              </select>
            </div>
          </div>

          <div className="table-responsive shadow-sm rounded">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" width="5%">
                    #
                  </th>
                  <th scope="col">Resource Type</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">CO₂ Equivalent</th>
                  <th scope="col">Date</th>
                  <th scope="col" width="15%">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherResources?.length > 0 ? (
                  otherResources?.map((resource, index) => (
                    <tr key={resource?._id}>
                      <td>{index + 1}</td>
                      <td>{resource?.emissionType?.name}</td>
                      <td>{resource?.quantity}</td>
                      <td>{resource?.co2Equivalent}</td>
                      <td>{new Date(resource?.date).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleEditResource(resource)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteResource(resource._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No resources found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "Manage Vehicles" && (
        <div className="container-fluid py-4 px-3">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h4 className="text-primary mb-0">Manage Vehicles</h4>
            <p className="mb-0">Total Vehicles: {vehicles.length}</p>
          </div>
          <div className="table-responsive shadow-sm rounded">
            <table className="table table-striped table-hover table-bordered mb-0">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th>Vehicle Name</th>
                  <th>License Plate</th>
                  <th>Vehicle Type</th>
                  <th>Engine Number</th>
                  <th>Vehicle Use</th>
                  <th>Vehicle Model</th>
                  <th width="15%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle, index) => (
                    <tr key={vehicle._id}>
                      <td>{index + 1}</td>
                      <td>{vehicle.vehicleName || "N/A"}</td>
                      <td>{vehicle.licensePlate || "N/A"}</td>
                      <td>{vehicle.vehicleType || "N/A"}</td>
                      <td>{vehicle.engineNumber || "N/A"}</td>
                      <td>{vehicle.vehicleUseFor || "N/A"}</td>
                      <td>{vehicle.vehicleModel || "N/A"}</td>
                      <td>
                        <button
                          className={`btn w-100 p-2 ${
                            vehicle.isFavorite
                              ? "btn-warning"
                              : "btn-outline-primary"
                          }`}
                          onClick={() => toggleFavorite(vehicle._id, index)}
                        >
                          {vehicle.isFavorite
                            ? "★ Favorite"
                            : "☆ Mark as Favorite"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <TransportEmissions activeTab={activeTab} />
      {isTransportationModalVisible && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="transportationModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="transportationModalLabel">
                  Add New Transportation Record
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsTransportationModalVisible(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEmpTransSubmit}>
                  <div className="mb-3">
                    <label htmlFor="transportationMode" className="form-label">
                      Transportation Mode
                    </label>
                    <select
                      id="transportationMode"
                      className="form-select"
                      name="transportationMode"
                      value={employeeTransportationData.transportationMode}
                      onChange={handleChange}
                      required
                    >
                      <option value="bike">Bike</option>
                      <option value="walking">Walking</option>
                      <option value="public transport">Public Transport</option>
                      <option value="car">Car</option>
                      <option value="plane">Plane</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="beginLocation" className="form-label">
                      Begin Location
                    </label>
                    <input
                      type="text"
                      id="beginLocation"
                      className="form-control"
                      name="beginLocation"
                      value={employeeTransportationData.beginLocation}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="endLocation" className="form-label">
                      End Location
                    </label>
                    <input
                      type="text"
                      id="endLocation"
                      className="form-control"
                      name="endLocation"
                      value={employeeTransportationData.endLocation}
                      disabled
                    />
                  </div>

                  <div className="mb-3"></div>
                  <div className="mb-3">
                    <label htmlFor="co2Emission" className="form-label">
                      CO₂ Emission per km
                    </label>
                    <input
                      type="number"
                      id="co2Emission"
                      className="form-control"
                      name="co2Emission"
                      value={employeeWorkTransportationData.co2Emission}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          co2Emission: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="usageType" className="form-label">
                      Usage Type
                    </label>
                    <select
                      id="usageType"
                      className="form-select"
                      name="usageType"
                      value={employeeWorkTransportationData.usageType}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          usageType: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select...</option>
                      <option value="company car">Company Car</option>
                      <option value="business travel">Business Travel</option>
                      <option value="commuting">Commuting</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="workFromHomeDays" className="form-label">
                      Work from Home Days (Per Week)
                    </label>
                    <input
                      type="number"
                      id="workFromHomeDays"
                      className="form-control"
                      name="workFromHomeDays"
                      value={employeeWorkTransportationData.workFromHomeDays}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          workFromHomeDays: e.target.value,
                        }))
                      }
                      min="0"
                      max="7"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="recurrenceDays" className="form-label">
                      Recurring Days
                    </label>
                    <select
                      id="recurrenceDays"
                      className="form-select"
                      name="recurrenceDays"
                      value={employeeWorkTransportationData.recurrenceDays}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          recurrenceDays: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select...</option>
                      <option value="1">1 Day</option>
                      <option value="2">2 Days</option>
                      <option value="3">3 Days</option>
                      <option value="4">4 Days</option>
                      <option value="5">5 Days</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="form-control"
                      name="date"
                      value={employeeWorkTransportationData.date}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                      Save Work Transport Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isOtherResourcesModalVisible && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="otherResourcesModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="otherResourcesModalLabel">
                  Add New Resource
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsOtherResourcesModalVisible(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleNewResourceSubmit}>
                  <div className="mb-3">
                    <label htmlFor="emissionType" className="form-label">
                      Emission Type
                    </label>
                    <Select
                      id="emissionType"
                      options={emissionTypes.map((type) => ({
                        value: type._id,
                        label: type.name,
                      }))}
                      onChange={handleEmissionTypeChange}
                      styles={customStyles}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      className="form-control"
                      name="quantity"
                      value={newResourceData.quantity}
                      onChange={handleNewResourceChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="co2Equivalent" className="form-label">
                      CO₂ Equivalent
                    </label>
                    <input
                      type="number"
                      id="co2Equivalent"
                      className="form-control"
                      name="co2Equivalent"
                      value={newResourceData.co2Equivalent}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="form-control"
                      name="date"
                      value={newResourceData.date}
                      onChange={handleNewResourceChange}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                      Save Resource
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isWorkTransportationModalVisible && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="extraTransportationModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="extraTransportationModalLabel">
                  Add New Work Transportation Record
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsWorkTransportationModalVisible(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleWorkTransSubmit}>
                  <div className="mb-3">
                    <label htmlFor="carType" className="form-label">
                      Choose Car Type
                    </label>
                    <select
                      id="carType"
                      className="form-select"
                      name="carType"
                      value={employeeWorkTransportationData.carType}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          carType: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select...</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="gasoline">Gasoline</option>
                      <option value="average">Average</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cars" className="form-label">
                      Select Transport
                    </label>
                    <select
                      id="cars"
                      className="form-select"
                      name="transport"
                      value={employeeWorkTransportationData.transport}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          transport: e.target.value,
                        }))
                      }
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {transport.map((user) => (
                        <option
                          key={user._id || user.value}
                          value={user._id || user.value}
                        >
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="co2Emission" className="form-label">
                      CO₂ Emission per km
                    </label>
                    <input
                      type="number"
                      id="co2Emission"
                      className="form-control"
                      name="co2Emission"
                      value={employeeWorkTransportationData.co2Emission}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          co2Emission: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="usageType" className="form-label">
                      Usage Type
                    </label>
                    <select
                      id="usageType"
                      className="form-select"
                      name="usageType"
                      value={employeeWorkTransportationData.usageType}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          usageType: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select...</option>
                      <option value="company car">Company Car</option>
                      <option value="business travel">Business Travel</option>
                      <option value="commuting">Commuting</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="workFromHomeDays" className="form-label">
                      Work from Home Days (Per Week)
                    </label>
                    <input
                      type="number"
                      id="workFromHomeDays"
                      className="form-control"
                      name="workFromHomeDays"
                      value={employeeWorkTransportationData.workFromHomeDays}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          workFromHomeDays: e.target.value,
                        }))
                      }
                      min="0"
                      max="7"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="recurrenceDays" className="form-label">
                      Recurring Days
                    </label>
                    <select
                      id="recurrenceDays"
                      className="form-select"
                      name="recurrenceDays"
                      value={employeeWorkTransportationData.recurrenceDays}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          recurrenceDays: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select...</option>
                      <option value="1">1 Day</option>
                      <option value="2">2 Days</option>
                      <option value="3">3 Days</option>
                      <option value="4">4 Days</option>
                      <option value="5">5 Days</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="form-control"
                      name="date"
                      value={employeeWorkTransportationData.date}
                      onChange={(e) =>
                        setEmployeeWorkTransportationData((prevData) => ({
                          ...prevData,
                          date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                      Save Work Transport Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isUpdateResourceModalVisible && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="updateResourceModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="updateResourceModalLabel">
                  Update Resource
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsUpdateResourceModalVisible(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateResourceSubmit}>
                  <div className="mb-3">
                    <label htmlFor="emissionType" className="form-label">
                      Emission Type
                    </label>
                    <select
                      id="emissionType"
                      className="form-control"
                      value={updateResourceData.emissionType || ""}
                      onChange={(e) =>
                        handleUpdateResourceChange({
                          target: {
                            name: "emissionType",
                            value: e.target.value,
                          },
                        })
                      }
                      required
                    >
                      <option value="" disabled>
                        Select Emission Type
                      </option>
                      {emissionTypes.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      className="form-control"
                      name="quantity"
                      value={updateResourceData.quantity}
                      onChange={handleUpdateResourceChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="co2Equivalent" className="form-label">
                      CO₂ Equivalent
                    </label>
                    <input
                      type="number"
                      id="co2Equivalent"
                      className="form-control"
                      name="co2Equivalent"
                      value={updateResourceData.co2Equivalent}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="form-control"
                      name="date"
                      value={updateResourceData.date}
                      onChange={handleUpdateResourceChange}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                      Update Resource
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Register Vehicle Modal */}
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
                  Vehicle Registration
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <VehicleRegisterPage
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

export default DashboardPage;
