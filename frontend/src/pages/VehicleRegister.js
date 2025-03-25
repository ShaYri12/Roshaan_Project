import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { REACT_APP_API_URL } from "../env";

const VehicleRegisterPage = ({ userData, isModelVisible, isAdmin }) => {
  const [vehicleName, setVehicleName] = useState(userData?.vehicleName || "");
  const [vehicleType, setVehicleType] = useState(
    userData?.vehicleType || "car"
  );
  const [engineNumber, setEngineNumber] = useState(
    userData?.engineNumber || ""
  );
  const [vehicleModel, setVehicleModel] = useState(
    userData?.vehicleModel || ""
  );
  const [vehicleUse, setVehicleUse] = useState(
    userData?.car?.name || "Personal"
  );
  const [licensePlate, setLicensePlate] = useState(
    userData?.car?.licensePlate || ""
  );
  const [carType, setCarType] = useState(
    userData?.car?.companyCar ? "Company" : "Personal"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isModelVisible) {
      setVehicleName(userData?.vehicleName || "");
      setVehicleType(userData?.vehicleType || "");
      setEngineNumber(userData?.engineNumber || "");
      setVehicleModel(userData?.vehicleModel || "");
      setVehicleUse(userData?.car?.name || "Personal");
      setLicensePlate(userData?.car?.licensePlate || "");
      setCarType(userData?.car?.companyCar ? "Company" : "Personal");
      setError("");
    }
  }, [userData, isModelVisible]);
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = user?.id;
  console.log("User ID:", userId); // ✅ Output: 677d81fc514db45c144072af

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = {
      vehicleName,
      vehicleType,
      engineNumber,
      vehicleModel,
      vehicleUseFor: carType, // Ensure consistency with the backend field name
      licensePlate,
      owner: userId, // Assuming the owner ID is needed
    };

    try {
      setIsLoading(true);

      const url = isModelVisible
        ? `${REACT_APP_API_URL}/vehicles/${userData?._id}`
        : `${REACT_APP_API_URL}/vehicles`;

      const method = isModelVisible ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();

        // ✅ Get existing user data without overwriting
        const storedUserData = localStorage.getItem("userObj");
        let existingUserData = storedUserData ? JSON.parse(storedUserData) : {};

        // ✅ Only update `vehicles` array, don't overwrite entire `userObj`
        existingUserData.vehicles = [
          ...(existingUserData.vehicles || []), // Keep existing vehicles
          responseData?.vehicle, // Add new vehicle
        ];

        // ✅ Store updated user data
        localStorage.setItem("userObj", JSON.stringify(existingUserData));

        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);

        // Handle specific error cases
        if (errorData.message && errorData.message.includes("duplicate")) {
          setError(
            "This license plate is already registered to another vehicle."
          );
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError(
            "An error occurred while saving the vehicle. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error during registration/update", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isModelVisible && !isAdmin && (
        <div className="headingTitle">
          <h4 className="text-center text-white bg-success p-2 rounded">
            <i className="fas fa-user-plus me-2"></i> Vehicle Registration
          </h4>
        </div>
      )}
      <div className={userData ? "" : "container py-5"}>
        <div className={userData ? "" : "row justify-content-center"}>
          <div className={userData ? "" : "col-md-8"}>
            <div className="container">
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className={
                  !isModelVisible && !isAdmin ? "border p-4 rounded" : ""
                }
              >
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
                    <select
                      className="form-select"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      required
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Truck">Truck</option>
                    </select>
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
                    <label className="form-label">Vehicle Use</label>
                    <select
                      className="form-select"
                      value={vehicleUse}
                      onChange={(e) => setVehicleUse(e.target.value)}
                      required
                    >
                      <option value="Personal">Personal</option>
                      <option value="Company">Company</option>
                    </select>
                  </div>
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
                </div>

                <div className="mb-3">
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

                {!isModelVisible && !isAdmin && (
                  <div className="row text-center mt-3">
                    <span className="text-muted">
                      Already have an account?
                      <Link to="/" className="btn btn-link text-primary">
                        Login
                      </Link>
                    </span>
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        {isModelVisible ? "Updating..." : "Registering..."}
                      </>
                    ) : isModelVisible ? (
                      "Update"
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleRegisterPage;
