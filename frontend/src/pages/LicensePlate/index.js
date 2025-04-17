import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { REACT_APP_API_URL } from "../../env";
import Sidebar from "../../components/Sidebar";

const LicensePlatePage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [licensePlate, setLicensePlate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [co2Data, setCo2Data] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const resultSectionRef = useRef(null);

  // Fetch user data on component mount
  useEffect(() => {
    document.body.className = `${theme}-theme`;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (token && userObj) {
          setUserData(userObj);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    // Load search history from localStorage
    const loadSearchHistory = () => {
      const history = localStorage.getItem("licenseSearchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    };

    fetchUserData();
    loadSearchHistory();
  }, [navigate, theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  const formatLicensePlate = (plate) => {
    // Remove all whitespace and convert to uppercase
    return plate.replace(/\s/g, "").toUpperCase();
  };

  const searchLicensePlate = async (e) => {
    e.preventDefault();

    const formattedPlate = formatLicensePlate(licensePlate);
    if (!formattedPlate) {
      setError("Please enter a license plate");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVehicleData(null);
    setCo2Data(null);

    try {
      // Fetch vehicle data from backend proxy
      const vehicleResponse = await axios.get(
        `${REACT_APP_API_URL}/rdw/vehicle/${formattedPlate}`
      );

      // Fetch CO2 data from backend proxy
      const co2Response = await axios.get(
        `${REACT_APP_API_URL}/rdw/co2/${formattedPlate}`
      );

      if (vehicleResponse.data.length === 0) {
        setError("No vehicle data found for this license plate");
        setIsLoading(false);
        return;
      }

      const vData = vehicleResponse.data[0];
      const cData = co2Response.data.length > 0 ? co2Response.data[0] : null;

      setVehicleData(vData);
      setCo2Data(cData);

      // Add to search history
      const historyEntry = {
        licensePlate: formattedPlate,
        make: vData.merk || "Unknown",
        model: vData.handelsbenaming || "Unknown",
        co2: cData ? cData.brandstofverbruik_gecombineerd : "N/A",
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [
        historyEntry,
        ...searchHistory.filter((item) => item.licensePlate !== formattedPlate),
      ].slice(0, 10);

      setSearchHistory(updatedHistory);
      localStorage.setItem(
        "licenseSearchHistory",
        JSON.stringify(updatedHistory)
      );

      // Scroll to the result section after a short delay to ensure rendering is complete
      setTimeout(() => {
        if (resultSectionRef.current) {
          resultSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      setError("Failed to fetch vehicle data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (plate) => {
    setLicensePlate(plate);
    // Trigger search after setting the license plate
    setTimeout(() => {
      document.getElementById("search-button").click();
    }, 50);
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container">
          <h1 className="my-4">License Plate CO₂ Emissions</h1>

          <div className="row mb-4">
            <div className="col-12">
              <div className={`bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title">Search by License Plate</h5>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={searchLicensePlate}>
                    <div className="mb-3">
                      <label htmlFor="licensePlate" className="form-label">
                        License Plate
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="licensePlate"
                          placeholder="Example: JJ447K"
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="submit"
                          className="btn btn-success btn-no-transform"
                          disabled={isLoading}
                          id="search-button"
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Searching...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-search me-2"></i>
                              Search
                            </>
                          )}
                        </button>
                      </div>
                      <small className="text-muted">
                        Example: Enter 28SFJR for a blue Peugeot 206
                      </small>
                    </div>
                  </form>

                  {searchHistory.length > 0 && (
                    <div className="mt-4">
                      <h6>Recent Searches</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead>
                            <tr>
                              <th>License Plate</th>
                              <th>Make</th>
                              <th>Model</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchHistory.map((item, index) => (
                              <tr key={index}>
                                <td>{item.licensePlate}</td>
                                <td>{item.make}</td>
                                <td>{item.model}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() =>
                                      loadFromHistory(item.licensePlate)
                                    }
                                  >
                                    Search Again
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12" ref={resultSectionRef}>
              {vehicleData && (
                <div className={`bg-${theme} border-0 shadow-sm h-100`}>
                  <div className="card-body">
                    <h5 className="card-title">Vehicle Information</h5>

                    <div className="vehicle-info mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="license-plate-display me-3 p-2 px-3 rounded"
                          style={{
                            backgroundColor: "#FFDD00",
                            border: "1px solid #000",
                            color: "#000",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                          }}
                        >
                          {formatLicensePlate(licensePlate)}
                        </div>
                        <div>
                          <h4 className="mb-0">
                            {vehicleData.merk} {vehicleData.handelsbenaming}
                          </h4>
                          <p className="text-muted mb-0">
                            {vehicleData.eerste_kleur || "Unknown color"} -
                            Year:{" "}
                            {vehicleData.datum_eerste_toelating
                              ? new Date(
                                  vehicleData.datum_eerste_toelating
                                ).getFullYear()
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="row row-gap-3">
                      <div className="col-md-6">
                        <h6>Vehicle Details</h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <th>Make</th>
                                <td>{vehicleData.merk || "N/A"}</td>
                              </tr>
                              <tr>
                                <th>Model</th>
                                <td>{vehicleData.handelsbenaming || "N/A"}</td>
                              </tr>
                              <tr>
                                <th>Type</th>
                                <td>{vehicleData.voertuigsoort || "N/A"}</td>
                              </tr>
                              <tr>
                                <th>Color</th>
                                <td>{vehicleData.eerste_kleur || "N/A"}</td>
                              </tr>
                              <tr>
                                <th>Fuel Type</th>
                                <td>
                                  {vehicleData.brandstof_omschrijving || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <th>Number of Cylinders</th>
                                <td>{vehicleData.aantal_cilinders || "N/A"}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <h6>Emissions Data</h6>
                        {co2Data ? (
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <th>CO₂ Emissions (combined)</th>
                                <td>
                                  {co2Data.brandstofverbruik_gecombineerd ||
                                    "N/A"}
                                  {co2Data.brandstofverbruik_gecombineerd
                                    ? " g/km"
                                    : ""}
                                </td>
                              </tr>
                              <tr>
                                <th>CO₂ Emissions (city)</th>
                                <td>
                                  {co2Data.brandstofverbruik_stad || "N/A"}
                                  {co2Data.brandstofverbruik_stad
                                    ? " g/km"
                                    : ""}
                                </td>
                              </tr>
                              <tr>
                                <th>CO₂ Emissions (highway)</th>
                                <td>
                                  {co2Data.brandstofverbruik_buitenweg || "N/A"}
                                  {co2Data.brandstofverbruik_buitenweg
                                    ? " g/km"
                                    : ""}
                                </td>
                              </tr>
                              <tr>
                                <th>Emission Class</th>
                                <td>
                                  {co2Data.emissiecode_omschrijving || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <th>Fuel Efficiency Class</th>
                                <td>{co2Data.zuinigheidslabel || "N/A"}</td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <div className="alert alert-info">
                            No emissions data available for this vehicle.
                          </div>
                        )}
                      </div>
                    </div>

                    {co2Data && (
                      <div className="mt-3">
                        <h6>Environmental Impact</h6>
                        <div className="progress mb-2">
                          <div
                            className={`progress-bar bg-${
                              parseInt(co2Data.brandstofverbruik_gecombineerd) <
                              100
                                ? "success"
                                : parseInt(
                                    co2Data.brandstofverbruik_gecombineerd
                                  ) < 150
                                ? "warning"
                                : "danger"
                            }`}
                            role="progressbar"
                            style={{
                              width: `${Math.min(
                                (parseInt(
                                  co2Data.brandstofverbruik_gecombineerd
                                ) /
                                  250) *
                                  100,
                                100
                              )}%`,
                            }}
                            aria-valuenow={
                              co2Data.brandstofverbruik_gecombineerd
                            }
                            aria-valuemin="0"
                            aria-valuemax="250"
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-success">Low Emissions</span>
                          <span className="text-danger">High Emissions</span>
                        </div>
                        <p className="mt-3">
                          <small className="text-muted">
                            The average new car in Europe produces approximately
                            120g/km of CO₂. This vehicle produces{" "}
                            {co2Data.brandstofverbruik_gecombineerd ||
                              "unknown"}{" "}
                            g/km, which is{" "}
                            {co2Data.brandstofverbruik_gecombineerd
                              ? parseInt(
                                  co2Data.brandstofverbruik_gecombineerd
                                ) < 120
                                ? "below"
                                : "above"
                              : "compared to"}{" "}
                            the European average.
                          </small>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!vehicleData && !isLoading && (
                <div className={`bg-${theme} border-0 shadow-sm h-100`}>
                  <div className="card-body text-center d-flex flex-column justify-content-center align-items-center py-5">
                    <i className="fas fa-car fa-4x mb-4 text-muted"></i>
                    <h5>Enter a License Plate</h5>
                    <p className="text-muted">
                      Enter a license plate to retrieve vehicle and CO₂
                      emissions data
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className={`bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title">How It Works</h5>
                  <p>
                    This tool uses the Dutch RDW (Rijksdienst voor het
                    Wegverkeer) API to retrieve vehicle data and CO₂ emissions
                    based on license plates. The data includes:
                  </p>
                  <ul>
                    <li>Vehicle basic information (make, model, year, etc.)</li>
                    <li>
                      CO₂ emissions data (g/km) for different driving conditions
                    </li>
                    <li>
                      Environmental classifications and emission standards
                    </li>
                  </ul>
                  <p>
                    <strong>Note:</strong> This tool works best with Dutch
                    license plates. If you're testing, you can use the example
                    license plate: JJ447K.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensePlatePage;
