import { useState, useEffect } from "react";
import {
  fetchOtherResources,
  fetchEmissionTypes,
  addResourceEmission,
  updateResourceEmission,
  deleteResourceEmission,
} from "../resourceUtils";

/**
 * Custom hook for managing resource data
 * @param {string} employeeId - Optional employee ID to filter by
 * @returns {Object} Resource state and handlers
 */
const useResourceData = (employeeId) => {
  const [otherResources, setOtherResources] = useState([]);
  const [emissionTypes, setEmissionTypes] = useState([]);
  const [conversionFactor, setConversionFactor] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // New resource form state
  const [newResourceData, setNewResourceData] = useState({
    emissionType: "",
    quantity: "",
    co2Equivalent: "",
    date: "",
  });

  // Update resource form state
  const [updateResourceData, setUpdateResourceData] = useState({
    emissionType: "",
    quantity: "",
    co2Equivalent: "",
    date: "",
  });

  const [selectedResourceId, setSelectedResourceId] = useState(null);

  // Fetch other resources
  const loadOtherResources = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOtherResources(employeeId);
      setOtherResources(data);
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch emission types on initial load
  useEffect(() => {
    const loadEmissionTypes = async () => {
      const data = await fetchEmissionTypes();
      setEmissionTypes(data);
    };

    loadEmissionTypes();
  }, []);

  // Handle new resource form changes
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

  // Handle emission type change
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

  // Handle adding a new resource
  const handleAddResource = async () => {
    try {
      await addResourceEmission(newResourceData, employeeId);
      // Reset form
      setNewResourceData({
        emissionType: "",
        quantity: "",
        co2Equivalent: "",
        date: "",
      });
      return true;
    } catch (error) {
      console.error("Error adding resource:", error);
      return false;
    }
  };

  // Handle update resource form changes
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

  // Set up resource for editing
  const initEditResource = (resource) => {
    setSelectedResourceId(resource?._id);
    setUpdateResourceData({
      emissionType: resource.emissionType?._id,
      quantity: resource.quantity,
      co2Equivalent: resource.co2Equivalent,
      date: new Date(resource.date).toISOString().split("T")[0],
    });
    setConversionFactor(resource.emissionType?.conversionFactor || 0);
  };

  // Handle resource update
  const handleUpdateResource = async () => {
    try {
      await updateResourceEmission(
        selectedResourceId,
        updateResourceData,
        conversionFactor
      );
      // Reset form
      setUpdateResourceData({
        emissionType: "",
        quantity: "",
        co2Equivalent: "",
        date: "",
      });
      setSelectedResourceId(null);
      return true;
    } catch (error) {
      console.error("Error updating resource:", error);
      return false;
    }
  };

  // Handle resource deletion
  const handleDeleteResource = async (resourceId) => {
    try {
      await deleteResourceEmission(resourceId);
      return true;
    } catch (error) {
      console.error("Error deleting resource:", error);
      return false;
    }
  };

  return {
    // States
    otherResources,
    emissionTypes,
    conversionFactor,
    newResourceData,
    updateResourceData,
    selectedResourceId,
    isLoading,

    // Setters
    setOtherResources,
    setEmissionTypes,
    setConversionFactor,
    setNewResourceData,
    setUpdateResourceData,
    setSelectedResourceId,

    // Actions
    loadOtherResources,
    handleNewResourceChange,
    handleEmissionTypeChange,
    handleAddResource,
    handleUpdateResourceChange,
    initEditResource,
    handleUpdateResource,
    handleDeleteResource,
  };
};

export default useResourceData;
