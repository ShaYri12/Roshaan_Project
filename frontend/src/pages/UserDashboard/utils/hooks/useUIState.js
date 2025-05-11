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

  // Theme toggle handler - memoized to ensure stable identity
  const handleThemeToggle = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.body.className = `${newTheme}-theme`; // Apply theme class to body
      return newTheme;
    });
  }, []);

  // Memoize event handler callbacks
  const handleAddNewTransportCallback = useCallback(() => {
    if (handleAddNewTransport && typeof handleAddNewTransport === "function") {
      handleAddNewTransport();
    }
    setIsTransportationModalVisible(true);
  }, [handleAddNewTransport]);

  const handleAddNewWorkTransportCallback = useCallback(() => {
    if (
      handleAddNewWorkTransport &&
      typeof handleAddNewWorkTransport === "function"
    ) {
      handleAddNewWorkTransport();
    }
    setIsWorkTransportationModalVisible(true);
  }, [handleAddNewWorkTransport]);

  const handleAddOtherResourceCallback = useCallback(() => {
    if (
      handleAddOtherResource &&
      typeof handleAddOtherResource === "function"
    ) {
      handleAddOtherResource();
    }
    setIsOtherResourcesModalVisible(true);
  }, [handleAddOtherResource]);

  const handleVehicleModalCallback = useCallback(() => {
    if (handleVehicleModal && typeof handleVehicleModal === "function") {
      handleVehicleModal(true);
    }
    setIsRegModel(true);
  }, [handleVehicleModal]);

  const handleProfileModalCallback = useCallback(() => {
    if (handleProfileModal && typeof handleProfileModal === "function") {
      handleProfileModal();
    }
    setIsProfileModalVisible(true);
  }, [handleProfileModal]);

  // Initialize theme once on mount
  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);

  // Set up event listeners for modals - this effect doesn't depend on theme
  useEffect(() => {
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
    handleAddNewTransportCallback,
    handleAddNewWorkTransportCallback,
    handleVehicleModalCallback,
    handleAddOtherResourceCallback,
    handleProfileModalCallback,
  ]);

  // Close modal handler
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setIsRegModel(false);
  }, []);

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
