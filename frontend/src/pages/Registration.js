import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JWT_EMPLOYEE_SECRET, REACT_APP_API_URL } from "../env";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importing the eye icons
import LocationPicker from "../components/LocationPicker"; // Import LocationPicker

const RegisterPage = ({ userData, isModelVisible, isAdmin }) => {
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [homeAddress, setHomeAddress] = useState({
    address: userData?.homeAddress || "",
    lat: userData?.homeLocation?.lat || 0,
    lon: userData?.homeLocation?.lon || 0,
  });
  const [companyAddress, setCompanyAddress] = useState({
    address: userData?.companyAddress || "",
    lat: userData?.companyLocation?.lat || 0,
    lon: userData?.companyLocation?.lon || 0,
  });
  const [carName, setCarName] = useState(userData?.car?.name || ""); // Car name input
  const [licensePlate, setLicensePlate] = useState(
    userData?.car?.licensePlate || ""
  ); // License plate for the car
  const [carType, setCarType] = useState(userData?.car?.companyCar); // Whether the car is personal or company-owned
  const [email, setEmail] = useState(userData?.email || ""); // Email input
  const [password, setPassword] = useState(userData?.password || ""); // Password input (optional for editing)
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [isLoading, setIsLoading] = useState(false); // State for toggling password visibility

  // Get theme from localStorage or use light as default
  const theme = localStorage.getItem("theme") || "light";

  useEffect(() => {
    if (isModelVisible) {
      setFirstName(userData?.firstName || "");
      setLastName(userData?.lastName || "");
      setHomeAddress({
        address: userData?.homeAddress || "",
        lat: userData?.homeLocation?.lat || 0,
        lon: userData?.homeLocation?.lon || 0,
      });
      setCompanyAddress({
        address: userData?.companyAddress || "",
        lat: userData?.companyLocation?.lat || 0,
        lon: userData?.companyLocation?.lon || 0,
      });
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
      homeAddress: homeAddress.address,
      homeLocation: {
        lat: homeAddress.lat,
        lon: homeAddress.lon,
      },
      companyAddress: companyAddress.address,
      companyLocation: {
        lat: companyAddress.lat,
        lon: companyAddress.lon,
      },
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

      const url = isModelVisible
        ? `${REACT_APP_API_URL}/employees/${userData?._id}` // For edit mode, include the user ID in the URL
        : `${REACT_APP_API_URL}/employees`; // For registration, no user ID is needed

      const response = await fetch(url, {
        method: isModelVisible ? "PUT" : "POST", // Use PUT for updating and POST for creating new
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_EMPLOYEE_SECRET}`, // Include token for authentication
        },
        body: JSON.stringify(data), // Convert data to JSON format
      });

      // Check if the response was successful
      if (response.ok) {
        console.log(
          isModelVisible
            ? "Profile updated successfully!"
            : "Registration successful!"
        );
        const data = await response.json();
        localStorage.setItem("token", data?.employee?.jwtToken);
        localStorage.setItem("userObj", JSON.stringify(data?.employee));
        window.location.reload();
      } else {
        const errorData = await response.json(); // Parse the error response data
        console.error(
          isModelVisible ? "Profile update failed!" : "Registration failed!",
          errorData
        );
      }
    } catch (error) {
      // Log detailed error information
      console.error("Error during registration/update", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      {!isModelVisible && !isAdmin ? (
        <div className="headingTitle">
          <h4
            style={{
              textAlign: "center",
              fontFamily: "Arial, sans-serif",
              color: "#fff",
              background: "linear-gradient(to right, #198754, #20c997)",
              padding: "10px 20px",
              borderRadius: "8px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              display: "inline-block",
              animation: "slideIn 1s ease-out",
            }}
          >
            <i className="fas fa-user-plus" style={{ marginRight: "5px" }}></i>{" "}
            Employee Registration
          </h4>
        </div>
      ) : null}
      <div className={`${userData ? "" : "container py-5"}`}>
        <div className={`${userData ? "" : "row justify-content-center"} `}>
          <div className={`${userData ? "" : "col-md-8"}`}>
            {!isModelVisible && !isAdmin && (
              <div className="text-center mb-4">
                <img
                  src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
                  alt="Logo"
                  width={150}
                  height={84}
                  className="mb-3"
                />
              </div>
            )}
            <div className="container">
              <form
                onSubmit={handleSubmit}
                className={`${
                  !isModelVisible && !isAdmin ? "border p-4 rounded" : ""
                }`}
              >
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
                  {/* {!isModelVisible && ( */}
                  <div className="col-6 mb-3 position-relative">
                    <label className="form-label">Password</label>
                    <input
                      type={showPassword ? "text" : "password"} // Toggle between text and password
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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
                  <div className="col-6 mb-4">
                    <LocationPicker
                      label="Home Address"
                      value={homeAddress}
                      onChange={setHomeAddress}
                      required
                      mapHeight="200px"
                      placeholder="Enter your home address"
                    />
                  </div>
                  <div className="col-6 mb-4">
                    <LocationPicker
                      label="Company Address"
                      value={companyAddress}
                      onChange={setCompanyAddress}
                      required
                      mapHeight="200px"
                      placeholder="Enter company address"
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
                {!isModelVisible && !isAdmin ? (
                  <div className="row text-center mt-3">
                    <span className="text-muted">
                      Already have an account?
                      <Link
                        to="/"
                        className="btn btn-link text-success"
                        style={{ fontSize: "16px" }}
                      >
                        Login
                      </Link>
                    </span>
                  </div>
                ) : null}
                <div className="row">
                  <div className="col-12 mt-3 mb-3 d-flex justify-content-center">
                    <button
                      className="btn btn-success w-50"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div
                          className="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : isModelVisible ? (
                        "Update Profile"
                      ) : (
                        "Register"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
