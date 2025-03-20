import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing the eye icons
import { REACT_APP_API_URL } from "../env";

const UpdateVehicle = ({ userData, isModelVisible, onUpdate }) => {
  const [vehicleName, setVehicleName] = useState(userData?.vehicleName || "");
  const [vehicleType, setVehicleType] = useState(userData?.vehicleType || "");
  const [engineNumber, setEngineNumber] = useState(userData?.engineNumber || "");
  const [vehicleModel, setVehicleModel] = useState(userData?.vehicleModel || "");
  const [licensePlate, setLicensePlate] = useState(userData?.car?.licensePlate || "");
  const [carType, setCarType] = useState(userData?.car?.companyCar ? "Company" : "Personal");
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (isModelVisible) {
      setVehicleName(userData?.vehicleName || "");
      setVehicleType(userData?.vehicleType || "");
      setEngineNumber(userData?.engineNumber || "");
      setVehicleModel(userData?.vehicleModel || "");
      setLicensePlate(userData?.car?.licensePlate || "");
      setCarType(userData?.car?.companyCar ? "Company" : "Personal");
    }
  }, [userData, isModelVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      vehicleName,
      vehicleType,
      engineNumber,
      vehicleModel,
      licensePlate,
      carType,
    };

    try {
      setIsLoading(true); // Set loading state

      const url = `${REACT_APP_API_URL}/vehicles/${userData?._id}`; // Update API endpoint

      const response = await fetch(url, {
        method: "PUT", // Use PUT for updating
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
        },
        body: JSON.stringify(data), // Convert data to JSON format
      });

      if (response.ok) {
        const responseData = await response.json();
        onUpdate(responseData?.vehicle);
        console.log("Vehicle updated successfully!");
      } else {
        console.error("Vehicle update failed!");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Vehicle Name</label>
            <input
              type="text"
              className="form-control"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Vehicle Type</label>
            <input
              type="text"
              className="form-control"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Engine Number</label>
            <input
              type="text"
              className="form-control"
              value={engineNumber}
              onChange={(e) => setEngineNumber(e.target.value)}
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Vehicle Model</label>
            <input
              type="text"
              className="form-control"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">License Plate</label>
            <input
              type="text"
              className="form-control"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Car Type</label>
            <select
              className="form-select"
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              required
            >
              <option value="Personal">Personal</option>
              <option value="Company">Company</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateVehicle;
