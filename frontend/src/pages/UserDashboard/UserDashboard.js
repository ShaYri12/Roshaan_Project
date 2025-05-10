import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import Sidebar from "../../components/Sidebar";
import TransportTable from "./components/TransportTable";
import WorkTransportTable from "./components/WorkTransportTable";
import ResourcesTable from "./components/ResourcesTable";
import VehiclesTable from "./components/VehiclesTable";
import TransportEmissions from "./components/TransportEmissions";

// Modals
import TransportationModal from "./components/modals/TransportationModal";
import WorkTransportationModal from "./components/modals/WorkTransportationModal";
import ResourceModal from "./components/modals/ResourceModal";
import UpdateResourceModal from "./components/modals/UpdateResourceModal";
import ProfileModal from "./components/modals/ProfileModal";
import VehicleModal from "./components/modals/VehicleModal";

// Hooks
import useTransportData from "./utils/hooks/useTransportData";
import useResourceData from "./utils/hooks/useResourceData";
import useVehicleData from "./utils/hooks/useVehicleData";
import useUIState from "./utils/hooks/useUIState";

const DashboardPage = () => {
  const { id } = useParams(); // Extract ID from URL
  const navigate = useNavigate();
  const [employeeId] = useState(id ?? null);
  const [userData, setUserData] = useState(null);

  // Initialize hooks
  const transportData = useTransportData(employeeId);
  const resourceData = useResourceData(employeeId);
  const vehicleData = useVehicleData();

  // Initialize UI state with callbacks
  const uiState = useUIState(
    transportData.initializeTransportationData,
    transportData.initializeWorkTransportationData,
    () => {}, // No initialization needed for resources
    (show) => setIsRegModel(show),
    () => {} // No initialization needed for profile
  );

  // Destructure state from hooks for convenience
  const {
    employeeTransListing,
    globalTransportationData,
    workTransportationData,
    globalWorkTransportationData,
    transport,
    employeeTransportationData,
    employeeWorkTransportationData,
    setEmployeeTransportationData,
    setEmployeeWorkTransportationData,
    filterTransportationData,
  } = transportData;

  const {
    otherResources,
    loadOtherResources,
    handleNewResourceChange,
    handleEmissionTypeChange,
    handleAddResource,
    handleUpdateResourceChange,
    initEditResource,
    handleUpdateResource,
    handleDeleteResource,
    emissionTypes,
    newResourceData,
    updateResourceData,
  } = resourceData;

  const { vehicles, handleToggleFavorite } = vehicleData;

  const {
    theme,
    activeTab,
    filterType,
    isSidebarOpen,
    isTransportationModalVisible,
    isWorkTransportationModalVisible,
    isOtherResourcesModalVisible,
    isUpdateResourceModalVisible,
    isProfileModalVisible,
    isRegModel,
    setActiveTab,
    setFilterType,
    setIsSidebarOpen,
    setIsTransportationModalVisible,
    setIsWorkTransportationModalVisible,
    setIsOtherResourcesModalVisible,
    setIsUpdateResourceModalVisible,
    setIsProfileModalVisible,
    setIsRegModel,
    handleThemeToggle,
    closeModal,
  } = uiState;

  // Load additional resources when tab changes
  useEffect(() => {
    if (
      activeTab === "otherResources" &&
      !resourceData.isLoading &&
      otherResources.length === 0
    ) {
      loadOtherResources();
    }
  }, [
    activeTab,
    loadOtherResources,
    resourceData.isLoading,
    otherResources.length,
  ]);

  // Apply filter when filter type or tab changes
  useEffect(() => {
    filterTransportationData(filterType, activeTab);
  }, [
    filterType,
    activeTab,
    globalTransportationData,
    globalWorkTransportationData,
    filterTransportationData,
  ]);

  // Fetch user data on component mount
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

  // Handle transportation form changes
  const handleTransportationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployeeTransportationData((prevData) => {
      if (type === "checkbox") {
        return { ...prevData, [name]: checked };
      }
      return { ...prevData, [name]: value };
    });
  };

  // Handle work transportation form changes
  const handleWorkTransportationChange = (e) => {
    const { name, value } = e.target;
    setEmployeeWorkTransportationData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle profile update
  const handleProfileUpdate = (updatedData) => {
    localStorage.setItem("userObj", JSON.stringify(updatedData));
    window.location.reload();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    navigate("/");
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={handleThemeToggle}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="mt-2 mt-md-0">
          <div className="container-fluid px-0">
            <ul className="nav nav-tabs py-2">
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "transport" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("transport")}
                >
                  <i className="fas fa-car me-1"></i> Transport
                </button>
              </li>
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "workTransport" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("workTransport")}
                >
                  <i className="fas fa-building me-1"></i> Work Transport
                </button>
              </li>
              <li className="nav-item tab-item">
                <button
                  className={`nav-link ${
                    activeTab === "otherResources" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("otherResources")}
                >
                  <i className="fas fa-leaf me-1"></i> Other Resources
                </button>
              </li>
              <li className="nav-item tab-item">
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
              <li className="nav-item tab-item">
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

          {/* Transport Tab */}
          {activeTab === "transport" && (
            <div className="container-fluid mt-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
                <h4 className="text-success mb-0">Transportation Records</h4>
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

              <TransportTable records={employeeTransListing} />
            </div>
          )}

          {/* Work Transport Tab */}
          {activeTab === "workTransport" && (
            <div className="container-fluid mt-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="text-success mb-0">
                  Work Transportation Records
                </h4>
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

              <WorkTransportTable records={workTransportationData} />
            </div>
          )}

          {/* Other Resources Tab */}
          {activeTab === "otherResources" && (
            <div className="container-fluid mt-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="text-success mb-0">Other Resources</h4>
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

              <ResourcesTable
                resources={otherResources}
                onEdit={initEditResource}
                onDelete={handleDeleteResource}
              />
            </div>
          )}

          {/* Manage Vehicles Tab */}
          {activeTab === "Manage Vehicles" && (
            <div className="container-fluid py-4 px-3">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h4 className="text-success mb-0">Manage Vehicles</h4>
                <p className="mb-0">Total Vehicles: {vehicles.length}</p>
              </div>

              <VehiclesTable
                vehicles={vehicles}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}

          {/* Transport Emissions Tab */}
          {activeTab === "TransportEmissions" && (
            <TransportEmissions activeTab={activeTab} />
          )}

          {/* Modals */}
          <TransportationModal
            visible={isTransportationModalVisible}
            onClose={() => setIsTransportationModalVisible(false)}
            formData={employeeTransportationData}
            onChange={handleTransportationChange}
            onSubmitSuccess={() => {
              setIsTransportationModalVisible(false);
              filterTransportationData(filterType, "transport");
            }}
          />

          <WorkTransportationModal
            visible={isWorkTransportationModalVisible}
            onClose={() => setIsWorkTransportationModalVisible(false)}
            formData={employeeWorkTransportationData}
            onChange={handleWorkTransportationChange}
            transportOptions={transport}
            onSubmitSuccess={() => {
              setIsWorkTransportationModalVisible(false);
              filterTransportationData(filterType, "workTransport");
            }}
          />

          <ResourceModal
            visible={isOtherResourcesModalVisible}
            onClose={() => setIsOtherResourcesModalVisible(false)}
            formData={newResourceData}
            emissionTypes={emissionTypes}
            onChange={handleNewResourceChange}
            onEmissionTypeChange={handleEmissionTypeChange}
            onSubmit={async () => {
              const success = await handleAddResource();
              if (success) {
                setIsOtherResourcesModalVisible(false);
                await loadOtherResources();
              }
            }}
            theme={theme}
          />

          <UpdateResourceModal
            visible={isUpdateResourceModalVisible}
            onClose={() => setIsUpdateResourceModalVisible(false)}
            formData={updateResourceData}
            emissionTypes={emissionTypes}
            onChange={handleUpdateResourceChange}
            onSubmit={async () => {
              const success = await handleUpdateResource();
              if (success) {
                setIsUpdateResourceModalVisible(false);
                await loadOtherResources();
              }
            }}
          />

          <VehicleModal
            visible={isRegModel}
            onClose={() => {
              closeModal();
              vehicleData.refreshVehicles();
            }}
          />

          <ProfileModal
            visible={isProfileModalVisible}
            onClose={() => setIsProfileModalVisible(false)}
            userData={userData}
            onUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
