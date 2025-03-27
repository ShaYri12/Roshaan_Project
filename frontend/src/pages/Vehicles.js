import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  JWT_ADMIN_SECRET,
  JWT_EMPLOYEE_SECRET,
  REACT_APP_API_URL,
} from "../env";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaHome, FaPlusCircle } from "react-icons/fa";
import VehicleRegisterPage from "./VehicleRegister";
import UpdateVehicle from "./UpdateVehicle";

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegModel, setIsRegModel] = useState(false);
  const [isModalVisible, setModalVisible] = useState(null);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/vehicles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const deleteVehicle = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/vehicles/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        });

        if (response.ok) {
          setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
        } else {
          throw new Error("Failed to delete vehicle");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const editVehicle = (vehicle) => {
    setModalVisible(vehicle);
  };

  const regVehicle = (e) => {
    setIsRegModel(e);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsRegModel(false);
  };
  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="alert alert-info" role="alert">
          Loading Vehicles...
        </div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedData) => {
    localStorage.setItem("userObj", JSON.stringify(updatedData));
    window.location.reload();
  };

  return (
    <div>
      {/* Navbar with Home Icon */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <span className="navbar-brand">
            <div className="d-flex align-items-center">
              <i className="fas fa-car fa-2x me-3"></i>
              <h4 className="card-title mb-0">Vehicles</h4>
            </div>
          </span>
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/dashboard")}
          >
            <FaHome className="me-2" /> Home
          </button>
        </div>
      </nav>

      {/* Vehicle Listing Table */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
          <p className="mb-0">Total: {vehicles.length}</p>
          <button
            className="btn btn-outline-success d-flex align-items-center px-4 py-1 rounded-3 shadow-sm hover-shadow"
            onClick={() => regVehicle(true)}
          >
            <FaPlusCircle className="me-2" />
            Register Vehicle
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle Name</th>
                <th>License Plate</th>
                <th>Vehicle Type</th>
                <th>Engine Number</th>
                <th>Vehicle Use</th>
                <th>Vehicle Model</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => (
                  <tr key={vehicle._id}>
                    <td>{index + 1}</td>
                    <td>{vehicle.vehicleName || "N/A"}</td>
                    <td>{vehicle.licensePlate || "N/A"}</td>
                    <td>{vehicle.vehicleType || "N/A"}</td>
                    <td>{vehicle.engineNumber || "N/A"}</td>
                    <td>{vehicle.vehicleUseFor || "N/A"}</td>
                    <td>{vehicle.vehicleModel || "N/A"}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => editVehicle(vehicle)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteVehicle(vehicle._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Update Modal */}
      {isModalVisible && (
        <div
          className="modal fade show custom-scrollbar"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Update Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <UpdateVehicle
                  userData={isModalVisible}
                  isModalVisible={isModalVisible}
                  onUpdate={(updatedData) => handleProfileUpdate(updatedData)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Vehicle Modal */}
      {isRegModel && (
        <div
          className="modal fade show custom-scrollbar"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Vehicle Registration
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <VehicleRegisterPage
                  userData={isRegModel}
                  isModalVisible={false}
                  isAdmin={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;
