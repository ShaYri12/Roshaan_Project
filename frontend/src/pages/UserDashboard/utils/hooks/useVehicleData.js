import { useState, useEffect } from "react";
import { fetchVehicles, toggleVehicleFavorite } from "../vehicleUtils";

/**
 * Custom hook for managing vehicle data
 * @returns {Object} Vehicle state and handlers
 */
const useVehicleData = () => {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  // Load vehicles on initial mount
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Error fetching vehicles:", err.message);
        setError(err.message);
      }
    };

    loadVehicles();
  }, []);

  // Toggle favorite status of a vehicle
  const handleToggleFavorite = async (vehicleId, index) => {
    try {
      const response = await toggleVehicleFavorite(vehicleId);

      // Update vehicle favorite status in state
      setVehicles((prevVehicles) => {
        const updatedVehicles = [...prevVehicles];
        if (updatedVehicles[index]) {
          updatedVehicles[index] = {
            ...updatedVehicles[index],
            isFavorite: response.vehicle.isFavorite,
          };
        }
        return updatedVehicles;
      });

      return true;
    } catch (err) {
      console.error("Error marking favorite:", err);
      return false;
    }
  };

  // Refresh vehicle data
  const refreshVehicles = async () => {
    try {
      const data = await fetchVehicles();
      setVehicles(data);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error refreshing vehicles:", err.message);
      setError(err.message);
      return false;
    }
  };

  return {
    // States
    vehicles,
    error,

    // Setters
    setVehicles,
    setError,

    // Actions
    handleToggleFavorite,
    refreshVehicles,
  };
};

export default useVehicleData;
