import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../../env";

/**
 * Fetches user vehicles
 * @returns {Promise<Array>} Array of vehicles
 */
export const fetchVehicles = async () => {
  try {
    // Get the user ID from localStorage
    const storedUserData = localStorage.getItem("userObj");
    const userData = storedUserData ? JSON.parse(storedUserData) : null;
    const userId = userData?._id;

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

    return data;
  } catch (err) {
    console.error("Error fetching vehicles:", err.message);
    throw err;
  }
};

/**
 * Toggles favorite status of a vehicle
 * @param {string} vehicleId - ID of the vehicle
 * @returns {Promise<Object>} Updated vehicle data
 */
export const toggleVehicleFavorite = async (vehicleId) => {
  try {
    console.log(`Attempting to toggle favorite for vehicle ${vehicleId}`);

    const response = await fetch(
      `${REACT_APP_API_URL}/vehicles/${vehicleId}/favorite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      }
    );

    // Log response status for debugging
    console.log(`Response status: ${response.status}`);

    // Parse response even if not ok to see error details
    const data = await response.json();

    if (!response.ok) {
      console.error("Server error response:", data);
      throw new Error(
        `Failed to mark favorite: ${data.message || response.statusText}`
      );
    }

    console.log("Favorite updated successfully:", data);
    return data;
  } catch (err) {
    console.error("Error marking favorite:", err);
    throw err;
  }
};
