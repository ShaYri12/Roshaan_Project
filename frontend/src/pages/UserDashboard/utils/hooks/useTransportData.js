import { useState, useEffect } from "react";
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

  // Fetch personal transportation data
  useEffect(() => {
    const loadTransportationData = async () => {
      const { filteredRecords, allRecords } = await fetchTransportationRecords(
        employeeId
      );
      setEmployeeTransListing(filteredRecords);
      setGlobalTransportationData(allRecords);
    };

    loadTransportationData();
  }, [employeeId]);

  // Fetch work transportation data
  useEffect(() => {
    const loadWorkTransportationData = async () => {
      const { filteredRecords, allRecords } =
        await fetchWorkTransportationRecords(employeeId);
      setWorkTransportationData(filteredRecords);
      setGlobalWorkTransportationData(allRecords);
    };

    loadWorkTransportationData();
  }, [employeeId]);

  // Fetch transportation modes
  useEffect(() => {
    const loadTransportModes = async () => {
      const data = await fetchTransportationModes();
      setTransport(data);
    };

    loadTransportModes();
  }, []);

  // Initialize transport data with user address
  const initializeTransportationData = () => {
    const userObj = JSON.parse(localStorage.getItem("userObj"));
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
  };

  // Initialize work transport data
  const initializeWorkTransportationData = () => {
    const userObj = JSON.parse(localStorage.getItem("userObj"));
    if (!userObj) {
      console.error("User object not found in localStorage");
      return;
    }

    setEmployeeWorkTransportationData((prev) => ({
      ...prev,
      employeeId: userObj?._id,
    }));
  };

  // Filter data based on filter type
  const filterTransportationData = (filterType, activeTab) => {
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
      console.error("Error in filtering transportation records:", error);
    }
  };

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

    // Utilities
    initializeTransportationData,
    initializeWorkTransportationData,
    filterTransportationData,
  };
};

export default useTransportData;
