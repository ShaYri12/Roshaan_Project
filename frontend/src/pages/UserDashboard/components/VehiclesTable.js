import React from "react";

/**
 * Table component for displaying vehicles
 */
const VehiclesTable = ({ vehicles = [], onToggleFavorite }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <table className="table table-striped table-hover table-bordered mb-0">
        <thead>
          <tr>
            <th width="5%">#</th>
            <th>Vehicle Name</th>
            <th>License Plate</th>
            <th>Vehicle Type</th>
            <th>Engine Number</th>
            <th>Vehicle Use</th>
            <th>Vehicle Model</th>
            <th width="15%">Actions</th>
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
                    className={`btn w-100 p-2 ${
                      vehicle.isFavorite ? "btn-warning" : "btn-outline-success"
                    }`}
                    onClick={() => onToggleFavorite(vehicle._id, index)}
                  >
                    {vehicle.isFavorite ? "★ Favorite" : "☆ Mark as Favorite"}
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
  );
};

export default VehiclesTable;
