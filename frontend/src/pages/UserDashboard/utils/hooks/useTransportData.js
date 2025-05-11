import { useState, useEffect, useCallback } from "react";
import {
  fetchTransportationRecords,
  fetchWorkTransportationRecords,
  fetchTransportationModes,
} from "../transportUtils";

/**
 * Custom hook for managing transportation data
 * @param {string} employeeId - Optional employee ID to filter by
 * @returns {Object} Transportation state and handlers
 */
const useTransportData = (employeeId) => {
  // States for personal transportation
  const [employeeTransListing, setEmployeeTransListing] = useState([]);
  const [globalTransportationData, setGlobalTransportationData] = useState([]);

  // States for work transportation
  const [workTransportationData, setWorkTransportationData] = useState([]);
  const [globalWorkTransportationData, setGlobalWorkTransportationData] =
    useState([]);

  // Transport options
  const [transport, setTransport] = useState([]);

  // Form data
  const [employeeTransportationData, setEmployeeTransportationData] = useState({
    transportationMode: "car",
    beginLocation: "",
    endLocation: "",
    date: "",
    recurring: false,
    employeeId: "",
    co2Emission: "",
    usageType: "",
    workFromHomeDays: "",
    recurrenceDays: "",
  });

  const [employeeWorkTransportationData, setEmployeeWorkTransportationData] =
    useState({});

  // Helper function to safely get user object
  const getSafeUserObj = useCallback(() => {
    try {
      const userObjStr = localStorage.getItem("userObj");
      if (!userObjStr) return null;
      return JSON.parse(userObjStr);
    } catch (error) {
      console.error("Error parsing user object from localStorage:", error);
      return null;
    }
  }, []);

  // Create a memoized function to load transportation data that can be exported
  const loadTransportationData = useCallback(async () => {
    try {
      console.log("Loading transportation data...");
      const { filteredRecords, allRecords } = await fetchTransportationRecords(
        employeeId
      );
      setEmployeeTransListing(filteredRecords);
      setGlobalTransportationData(allRecords);
      console.log("Transportation data loaded successfully!");
      return { filteredRecords, allRecords };
    } catch (error) {
      console.error("Error loading transportation data:", error);
      return null;
    }
  }, [employeeId]);

  // Create a memoized function to load work transportation data that can be exported
  const loadWorkTransportationData = useCallback(async () => {
    try {
      console.log("Loading work transportation data...");
      const { filteredRecords, allRecords } =
        await fetchWorkTransportationRecords(employeeId);
      setWorkTransportationData(filteredRecords);
      setGlobalWorkTransportationData(allRecords);
      console.log("Work transportation data loaded successfully!");
      return { filteredRecords, allRecords };
    } catch (error) {
      console.error("Error loading work transportation data:", error);
      return null;
    }
  }, [employeeId]);

  // Fetch transportation modes
  const loadTransportModes = useCallback(async () => {
    try {
      console.log("Loading transport modes...");
      const data = await fetchTransportationModes();
      setTransport(data);
      console.log("Transport modes loaded successfully!");
      return data;
    } catch (error) {
      console.error("Error loading transport modes:", error);
      return [];
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    loadTransportationData();
  }, [loadTransportationData]);

  useEffect(() => {
    loadWorkTransportationData();
  }, [loadWorkTransportationData]);

  useEffect(() => {
    loadTransportModes();
  }, [loadTransportModes]);

  // Initialize transport data with user address
  const initializeTransportationData = useCallback(() => {
    const userObj = getSafeUserObj();
    if (!userObj) {
      console.error("User object not found in localStorage");
      return;
    }

    setEmployeeTransportationData((prev) => ({
      ...prev,
      beginLocation: userObj?.homeAddress || "",
      endLocation: userObj?.companyAddress || "",
      employeeId: employeeId || userObj._id,
    }));
  }, [employeeId, getSafeUserObj]);

  // Initialize work transport data
  const initializeWorkTransportationData = useCallback(() => {
    const userObj = getSafeUserObj();
    if (!userObj) {
      console.error("User object not found in localStorage");
      return;
    }

    setEmployeeWorkTransportationData((prev) => ({
      ...prev,
      employeeId: userObj?._id || "",
    }));
  }, [getSafeUserObj]);

  // Filter data based on filter type - memoized with useCallback to prevent recreating on every render
  const filterTransportationData = useCallback(
    (filterType, activeTab) => {
      try {
        if (!filterType) {
          console.error("Invalid filter type provided.");
          return;
        }

        // Get the filtered records based on the current filter and tab
        let newRecords;
        const userObj = getSafeUserObj();
        const userId = employeeId || (userObj && userObj._id);

        if (!userId) {
          console.error("No user ID available for filtering");
          return;
        }

        if (filterType === "global") {
          // Show all records
          if (activeTab === "transport") {
            newRecords = globalTransportationData || [];
            // Only update if actually different to avoid unnecessary rerenders
            if (
              JSON.stringify(newRecords) !==
              JSON.stringify(employeeTransListing)
            ) {
              setEmployeeTransListing(newRecords);
            }
          } else if (activeTab === "workTransport") {
            newRecords = globalWorkTransportationData || [];
            if (
              JSON.stringify(newRecords) !==
              JSON.stringify(workTransportationData)
            ) {
              setWorkTransportationData(newRecords);
            }
          }
        } else {
          // Filter by user ID
          if (activeTab === "transport") {
            newRecords = (globalTransportationData || []).filter(
              (record) => record?.employeeId === userId
            );
            if (
              JSON.stringify(newRecords) !==
              JSON.stringify(employeeTransListing)
            ) {
              setEmployeeTransListing(newRecords);
            }
          } else if (activeTab === "workTransport") {
            newRecords = (globalWorkTransportationData || []).filter(
              (record) => record?.employeeId === userId
            );
            if (
              JSON.stringify(newRecords) !==
              JSON.stringify(workTransportationData)
            ) {
              setWorkTransportationData(newRecords);
            }
          }
        }
      } catch (error) {
        console.error("Error in filtering transportation records:", error);
      }
    },
    [
      employeeId,
      getSafeUserObj,
      globalTransportationData,
      globalWorkTransportationData,
      employeeTransListing,
      workTransportationData,
    ]
  );

  return {
    // States
    employeeTransListing,
    globalTransportationData,
    workTransportationData,
    globalWorkTransportationData,
    transport,
    employeeTransportationData,
    employeeWorkTransportationData,

    // Setters
    setEmployeeTransListing,
    setGlobalTransportationData,
    setWorkTransportationData,
    setGlobalWorkTransportationData,
    setEmployeeTransportationData,
    setEmployeeWorkTransportationData,

    // Data loading functions - exposed for direct calls
    loadTransportationData,
    loadWorkTransportationData,
    loadTransportModes,

    // Utilities
    initializeTransportationData,
    initializeWorkTransportationData,
    filterTransportationData,
  };
};

export default useTransportData;
