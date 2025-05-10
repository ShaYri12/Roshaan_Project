import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing UI state
 * @param {function} handleAddNewTransport - Function to handle adding new transport
 * @param {function} handleAddNewWorkTransport - Function to handle adding new work transport
 * @param {function} handleAddOtherResource - Function to handle adding new resource
 * @param {function} handleVehicleModal - Function to handle vehicle modal
 * @param {function} handleProfileModal - Function to handle profile modal
 * @returns {Object} UI state and handlers
 */
const useUIState = (
  handleAddNewTransport,
  handleAddNewWorkTransport,
  handleAddOtherResource,
  handleVehicleModal,
  handleProfileModal
) => {
  // UI state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [activeTab, setActiveTab] = useState("transport");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterType, setFilterType] = useState("self");

  // Modal visibility states
  const [isTransportationModalVisible, setIsTransportationModalVisible] =
    useState(false);
  const [
    isWorkTransportationModalVisible,
    setIsWorkTransportationModalVisible,
  ] = useState(false);
  const [isOtherResourcesModalVisible, setIsOtherResourcesModalVisible] =
    useState(false);
  const [isUpdateResourceModalVisible, setIsUpdateResourceModalVisible] =
    useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null);

  // Theme toggle handler
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`; // Apply theme class to body
  };

  // Memoize event handler callbacks
  const handleAddNewTransportCallback = useCallback(() => {
    if (handleAddNewTransport) {
      handleAddNewTransport();
    }
    setIsTransportationModalVisible(true);
  }, [handleAddNewTransport]);

  const handleAddNewWorkTransportCallback = useCallback(() => {
    if (handleAddNewWorkTransport) {
      handleAddNewWorkTransport();
    }
    setIsWorkTransportationModalVisible(true);
  }, [handleAddNewWorkTransport]);

  const handleAddOtherResourceCallback = useCallback(() => {
    if (handleAddOtherResource) {
      handleAddOtherResource();
    }
    setIsOtherResourcesModalVisible(true);
  }, [handleAddOtherResource]);

  const handleVehicleModalCallback = useCallback(() => {
    if (handleVehicleModal) {
      handleVehicleModal(true);
    }
    setIsRegModel(true);
  }, [handleVehicleModal]);

  const handleProfileModalCallback = useCallback(() => {
    if (handleProfileModal) {
      handleProfileModal();
    }
    setIsProfileModalVisible(true);
  }, [handleProfileModal]);

  // Set up event listeners for modals
  useEffect(() => {
    document.body.className = `${theme}-theme`;

    // Add event listeners for modal triggers
    window.addEventListener(
      "openTransportModal",
      handleAddNewTransportCallback
    );
    window.addEventListener(
      "openWorkTransportModal",
      handleAddNewWorkTransportCallback
    );
    window.addEventListener("openVehicleModal", handleVehicleModalCallback);
    window.addEventListener(
      "openOtherResourceModal",
      handleAddOtherResourceCallback
    );
    window.addEventListener("openProfileModal", handleProfileModalCallback);

    // Cleanup event listeners
    return () => {
      window.removeEventListener(
        "openTransportModal",
        handleAddNewTransportCallback
      );
      window.removeEventListener(
        "openWorkTransportModal",
        handleAddNewWorkTransportCallback
      );
      window.removeEventListener(
        "openVehicleModal",
        handleVehicleModalCallback
      );
      window.removeEventListener(
        "openOtherResourceModal",
        handleAddOtherResourceCallback
      );
      window.removeEventListener(
        "openProfileModal",
        handleProfileModalCallback
      );
    };
  }, [
    theme,
    handleAddNewTransportCallback,
    handleAddNewWorkTransportCallback,
    handleVehicleModalCallback,
    handleAddOtherResourceCallback,
    handleProfileModalCallback,
  ]);

  // Close modal handlers
  const closeModal = () => {
    setModalVisible(false);
    setIsRegModel(false);
  };

  return {
    // UI state
    theme,
    activeTab,
    filterType,
    isSidebarOpen,

    // Modal visibility
    isTransportationModalVisible,
    isWorkTransportationModalVisible,
    isOtherResourcesModalVisible,
    isUpdateResourceModalVisible,
    isProfileModalVisible,
    isRegModel,
    isModalVisible,

    // Setters
    setTheme,
    setActiveTab,
    setFilterType,
    setIsSidebarOpen,
    setIsTransportationModalVisible,
    setIsWorkTransportationModalVisible,
    setIsOtherResourcesModalVisible,
    setIsUpdateResourceModalVisible,
    setIsProfileModalVisible,
    setIsRegModel,
    setModalVisible,

    // Event handlers
    handleThemeToggle,
    handleAddNewTransportCallback,
    handleAddNewWorkTransportCallback,
    handleAddOtherResourceCallback,
    handleVehicleModalCallback,
    handleProfileModalCallback,
    closeModal,
  };
};

export default useUIState;
