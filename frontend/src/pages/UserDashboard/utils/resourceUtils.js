import axios from "axios";
import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../../env";

/**
 * Fetches emission resources for the logged-in user
 * @param {string} employeeId - Optional ID to filter by specific employee
 * @returns {Promise<Array>} Array of emission resources
 */
export const fetchOtherResources = async (employeeId) => {
  try {
    const userObj = JSON.parse(localStorage.getItem("userObj"));
    if (!userObj || !userObj._id) {
      console.error("User object not found or invalid in localStorage");
      return [];
    }

    const response = await axios.get(
      `${REACT_APP_API_URL}/user-emissions/${
        employeeId ? employeeId : userObj._id
      }`
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch other resources.");
    }
  } catch (error) {
    console.error("Error fetching other resources:", error);
    return [];
  }
};

/**
 * Fetches available emission types
 * @returns {Promise<Array>} Array of emission types
 */
export const fetchEmissionTypes = async () => {
  try {
    const response = await axios.get(`${REACT_APP_API_URL}/emission-types`, {
      headers: {
        Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching emission types:", error);
    return [];
  }
};

/**
 * Adds a new resource emission record
 * @param {Object} resourceData - Resource data to save
 * @param {string} employeeId - Optional employee ID
 * @returns {Promise<Object>} Response data
 */
export const addResourceEmission = async (resourceData, employeeId) => {
  try {
    const userObj = JSON.parse(localStorage.getItem("userObj"));
    const response = await axios.post(
      `${REACT_APP_API_URL}/user-emissions`,
      {
        ...resourceData,
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
      return response.data;
    } else {
      throw new Error("Failed to add resource.");
    }
  } catch (error) {
    console.error("Error adding resource:", error);
    throw error;
  }
};

/**
 * Updates an existing resource emission record
 * @param {string} resourceId - ID of the resource to update
 * @param {Object} resourceData - Updated resource data
 * @param {number} conversionFactor - Conversion factor for CO2 calculation
 * @returns {Promise<Object>} Response data
 */
export const updateResourceEmission = async (
  resourceId,
  resourceData,
  conversionFactor
) => {
  try {
    const response = await axios.put(
      `${REACT_APP_API_URL}/user-emissions/${resourceId}`,
      {
        ...resourceData,
        co2Equivalent: resourceData.quantity * conversionFactor,
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
      return response.data;
    } else {
      throw new Error("Failed to update resource.");
    }
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
};

/**
 * Deletes a resource emission record
 * @param {string} resourceId - ID of the resource to delete
 * @returns {Promise<Object>} Response data
 */
export const deleteResourceEmission = async (resourceId) => {
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
      return response.data;
    } else {
      throw new Error("Failed to delete resource.");
    }
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
};
