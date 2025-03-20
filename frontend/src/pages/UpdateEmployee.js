import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  JWT_ADMIN_SECRET,
  JWT_EMPLOYEE_SECRET,
  REACT_APP_API_URL,
} from "../env";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing the eye icons

const UpdateEmployee = ({ userData, isModelVisible, onUpdate }) => {
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [homeAddress, setHomeAddress] = useState(userData?.homeAddress || "");
  const [companyAddress, setCompanyAddress] = useState(
    userData?.companyAddress || ""
  );
  const [carName, setCarName] = useState(userData?.car?.name || ""); // Car name input
  const [licensePlate, setLicensePlate] = useState(
    userData?.car?.licensePlate || ""
  ); // License plate for the car
  const [carType, setCarType] = useState(userData?.car?.companyCar); // Whether the car is personal or company-owned
  const [email, setEmail] = useState(userData?.email || ""); // Email input
  const [password, setPassword] = useState(userData?.password || ""); // Password input (optional for editing)
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [isLoading, setIsLoading] = useState(false); // State for toggling password visibility
  const navigate = useNavigate();

  useEffect(() => {
    if (isModelVisible) {
      setFirstName(userData?.firstName || "");
      setLastName(userData?.lastName || "");
      setHomeAddress(userData?.homeAddress || "");
      setCompanyAddress(userData?.companyAddress || "");
      setCarName(userData?.car?.name || "");
      setLicensePlate(userData?.car?.licensePlate || "");
      setCarType(userData?.car?.companyCar);
      setEmail(userData?.email || "");
    }
  }, [userData, isModelVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data object
    const data = {
      firstName,
      lastName,
      homeAddress,
      companyAddress,
      car: {
        name: carName,
        licensePlate,
        type: "car",
        companyCar: carType,
      },
      email,
      password, // Include password in the data object for registration
    };

    try {
      setIsLoading(true); // Set loading state

      const url = `${REACT_APP_API_URL}/employees/${userData?._id}`; // For edit mode, include the user ID in the URL

      const response = await fetch(url, {
        method: "PUT", // Use PUT for updating and POST for creating new
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_EMPLOYEE_SECRET}`, // Include token for authentication
        },
        body: JSON.stringify(data), // Convert data to JSON format
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data", data);
        onUpdate(data?.employee);
        console.log("Profile updated successfully!");
      } else {
        const errorData = await response.json(); // Parse the error response data
        console.error("Profile update failed!");
      }
    } catch (error) {
      // Log detailed error information
      console.error("Error during registration/update", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        {/* Email and Password fields */}
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-6 mb-3 position-relative">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Eye Icon to toggle password visibility */}
            <div
              className="position-absolute"
              style={{
                top: "69%",
                right: "24px",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
              onClick={() => setShowPassword(!showPassword)} // Toggle visibility
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          {/* )} */}
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Home Address</label>
            <input
              type="text"
              className="form-control"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Company Address</label>
            <input
              type="text"
              className="form-control"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Car Name</label>
            <input
              type="text"
              className="form-control"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              required
            />
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
            <option value={false}>Personal</option>
            <option value={true}>Company</option>
          </select>
        </div>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEmployee;
