import React, { useState, useEffect } from "react";
import { REACT_APP_API_URL } from "../env";

const UpdateVehicle = ({ userData, isModelVisible, onUpdate }) => {
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [carType, setCarType] = useState("Personal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isModelVisible && userData) {
      setVehicleName(userData.vehicleName || "");
      setVehicleType(userData.vehicleType || "");
      setEngineNumber(userData.engineNumber || "");
      setVehicleModel(userData.vehicleModel || "");

      // Properly set license plate based on where it might be in the data structure
      if (userData.licensePlate) {
        setLicensePlate(userData.licensePlate);
      } else if (userData.car && userData.car.licensePlate) {
        setLicensePlate(userData.car.licensePlate);
      } else {
        setLicensePlate("");
      }

      setCarType(
        userData.car && userData.car.companyCar ? "Company" : "Personal"
      );
      setError("");
    }
  }, [userData, isModelVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = {
      vehicleName,
      vehicleType,
      engineNumber,
      vehicleModel,
      licensePlate,
      carType,
    };

    try {
      setIsLoading(true);

      const url = `${REACT_APP_API_URL}/vehicles/${userData?._id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        onUpdate(responseData?.vehicle);
        console.log("Vehicle updated successfully!");
      } else {
        const errorData = await response.json();
        if (errorData.message && errorData.message.includes("duplicate")) {
          setError(
            "This license plate is already registered to another vehicle."
          );
        } else {
          setError("Failed to update vehicle. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
            <small className="text-muted">
              Must be unique across all vehicles
            </small>
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
          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateVehicle;
