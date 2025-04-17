import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../../env";
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaRegStar,
  FaSearch,
  FaMapMarkerAlt,
  FaFilter,
  FaBuilding,
  FaWarehouse,
  FaHouseUser,
  FaStore,
  FaIndustry,
  FaMap,
  FaList,
} from "react-icons/fa";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Dropdown,
  DropdownButton,
  Badge,
  Tabs,
  Tab,
  Alert,
  Pagination,
} from "react-bootstrap";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Component to handle map clicks
const MapClickHandler = ({ onPositionSelected }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPositionSelected(lat, lng);
    },
  });
  return null;
};

const LocationsPage = () => {
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Locations data
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and pagination
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locationTypes, setLocationTypes] = useState([]);

  // Map state
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(13);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    coordinates: { lat: 0, lng: 0 },
    type: "office",
    description: "",
    company: "",
    isFavorite: false,
  });

  // Active tab
  const [activeTab, setActiveTab] = useState("list");

  // Companies state for dropdown
  const [companies, setCompanies] = useState([]);

  const navigate = useNavigate();
  const mapRef = useRef(null);

  // Apply theme class to body on mount and when theme changes
  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);

  // Fetch data on initial load
  useEffect(() => {
    fetchLocations();
    fetchLocationTypes();
    fetchCompanies();
  }, []);

  // Fetch locations with filtering and pagination
  const fetchLocations = async (
    page = 1,
    filterType = activeFilter,
    searchQuery = search
  ) => {
    try {
      setLoading(true);

      let url = `${REACT_APP_API_URL}/locations?page=${page}&limit=10`;

      if (filterType) {
        url += `&type=${filterType}`;
      }

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      setLocations(data.locations || []);
      setCurrentPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.pages || 1);

      // If we have locations, center the map on the first one
      if (data.locations && data.locations.length > 0) {
        const firstLocation = data.locations[0];
        setMapCenter([
          firstLocation.coordinates.lat,
          firstLocation.coordinates.lng,
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Fetch location types for filter dropdown
  const fetchLocationTypes = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/locations/types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const types = await response.json();
      setLocationTypes(types);
    } catch (error) {
      console.error("Error fetching location types:", error);
    }
  };

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLocations(1, activeFilter, search);
  };

  // Handle filter by type
  const handleFilterByType = (type) => {
    setActiveFilter(type === activeFilter ? null : type);
    fetchLocations(1, type === activeFilter ? null : type, search);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchLocations(page, activeFilter, search);
  };

  // Toggle location favorite status
  const toggleFavorite = async (id) => {
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/locations/${id}/favorite`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle favorite status");
      }

      // Update local state
      setLocations(
        locations.map((location) =>
          location._id === id
            ? { ...location, isFavorite: !location.isFavorite }
            : location
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError(error.message);
    }
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle coordinates change from map
  const handleCoordinatesChange = (lat, lng) => {
    setFormData({
      ...formData,
      coordinates: { lat, lng },
    });
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      coordinates: { lat: 0, lng: 0 },
      type: "office",
      description: "",
      company: "",
      isFavorite: false,
    });
  };

  // Open add modal
  const handleAddLocation = () => {
    resetFormData();
    setShowAddModal(true);
  };

  // Open edit modal
  const handleEditLocation = (location) => {
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city || "",
      country: location.country || "",
      postalCode: location.postalCode || "",
      coordinates: location.coordinates,
      type: location.type,
      description: location.description || "",
      company: location.company?._id || "",
      isFavorite: location.isFavorite,
    });
    setCurrentLocation(location._id);
    setShowEditModal(true);
  };

  // Confirm delete modal
  const handleDeleteConfirm = (id) => {
    setCurrentLocation(id);
    setShowDeleteConfirm(true);
  };

  // Submit add location form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${REACT_APP_API_URL}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add location");
      }

      setShowAddModal(false);
      fetchLocations(currentPage, activeFilter, search);
    } catch (error) {
      console.error("Error adding location:", error);
      setError(error.message);
    }
  };

  // Submit edit location form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/locations/${currentLocation}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      setShowEditModal(false);
      fetchLocations(currentPage, activeFilter, search);
    } catch (error) {
      console.error("Error updating location:", error);
      setError(error.message);
    }
  };

  // Delete location
  const handleDeleteLocation = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/locations/${currentLocation}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete location");
      }

      setShowDeleteConfirm(false);
      fetchLocations(currentPage, activeFilter, search);
    } catch (error) {
      console.error("Error deleting location:", error);
      setError(error.message);
    }
  };

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Function to get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "office":
        return <FaBuilding />;
      case "warehouse":
        return <FaWarehouse />;
      case "home":
        return <FaHouseUser />;
      case "retail":
        return <FaStore />;
      case "factory":
        return <FaIndustry />;
      default:
        return <FaMapMarkerAlt />;
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="navbar-inner d-flex justify-content-between align-items-center flex-wrap gap-2 px-3">
          <div className="d-flex align-items-center">
            <FaMapMarkerAlt className="me-2 fs-4" />
            <h4 className="card-title mb-0">Locations</h4>
          </div>
          <div>
            <button
              className="btn btn-outline-secondary me-2"
              onClick={toggleTheme}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <button
              className="btn btn-outline-success"
              onClick={() => navigate("/dashboard")}
            >
              <FaHome className="me-2" /> Home
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Search and Filter Bar */}
        <div className="row mb-4">
          <div className="col-md-8">
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search locations by name, address, city..."
                  value={search}
                  onChange={handleSearchChange}
                />
                <Button variant="primary" type="submit">
                  <FaSearch className="me-1" /> Search
                </Button>
              </InputGroup>
            </Form>
          </div>
          <div className="col-md-4 d-flex justify-content-end">
            <DropdownButton
              id="filter-dropdown"
              title={
                <>
                  <FaFilter /> Filter
                </>
              }
              variant="outline-secondary"
              className="me-2"
            >
              <Dropdown.Item
                active={activeFilter === null}
                onClick={() => handleFilterByType(null)}
              >
                All Types
              </Dropdown.Item>
              <Dropdown.Divider />
              {locationTypes.map((type) => (
                <Dropdown.Item
                  key={type}
                  active={activeFilter === type}
                  onClick={() => handleFilterByType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <Button variant="success" onClick={handleAddLocation}>
              <FaPlus className="me-1" /> Add Location
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError(null)}
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        {/* Tabs for List/Map View */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab
            eventKey="list"
            title={
              <>
                <FaList className="me-1" /> List View
              </>
            }
          >
            {/* List View Content */}
            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : locations.length === 0 ? (
              <Alert variant="info">
                No locations found. Try adjusting your search or filter, or add
                a new location.
              </Alert>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Type</th>
                      <th>Company</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location, index) => (
                      <tr key={location._id}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              {getTypeIcon(location.type)}
                            </span>
                            {location.name}
                            {location.isFavorite && (
                              <FaStar className="ms-2 text-warning" />
                            )}
                          </div>
                        </td>
                        <td>
                          {location.address}
                          {location.city && <span>, {location.city}</span>}
                          {location.country && (
                            <span>, {location.country}</span>
                          )}
                        </td>
                        <td>
                          <Badge bg="info">
                            {location.type.charAt(0).toUpperCase() +
                              location.type.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          {location.company ? location.company.name : "N/A"}
                        </td>
                        <td>
                          <div className="btn-group">
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => toggleFavorite(location._id)}
                              title={
                                location.isFavorite
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                            >
                              {location.isFavorite ? <FaStar /> : <FaRegStar />}
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                              title="Edit location"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteConfirm(location._id)}
                              title="Delete location"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Only show pages near current page to prevent too many buttons
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(currentPage - page) <= 1
                      );
                    })
                    .map((page, i, arr) => {
                      // Add ellipsis where there are gaps
                      if (i > 0 && page - arr[i - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <Pagination.Ellipsis disabled />
                            <Pagination.Item
                              active={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Pagination.Item>
                          </React.Fragment>
                        );
                      }
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}

                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Tab>

          <Tab
            eventKey="map"
            title={
              <>
                <FaMap className="me-1" /> Map View
              </>
            }
          >
            {/* Map View Content */}
            <div
              className="map-container"
              style={{ height: "600px", width: "100%" }}
            >
              {locations.length > 0 ? (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {locations.map((location) => (
                    <Marker
                      key={location._id}
                      position={[
                        location.coordinates.lat,
                        location.coordinates.lng,
                      ]}
                    >
                      <Popup>
                        <div>
                          <h6>
                            {location.name}{" "}
                            {location.isFavorite && (
                              <FaStar className="text-warning" />
                            )}
                          </h6>
                          <p className="mb-1">
                            <strong>Address:</strong> {location.address}
                            {location.city && <span>, {location.city}</span>}
                            {location.country && (
                              <span>, {location.country}</span>
                            )}
                          </p>
                          <p className="mb-1">
                            <strong>Type:</strong> {location.type}
                          </p>
                          {location.description && (
                            <p className="mb-1">
                              <strong>Description:</strong>{" "}
                              {location.description}
                            </p>
                          )}
                          <div className="mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                              className="me-1"
                            >
                              <FaEdit className="me-1" /> Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteConfirm(location._id)}
                            >
                              <FaTrash className="me-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="d-flex justify-content-center align-items-center h-100 bg-light">
                  <div className="text-center">
                    <FaMapMarkerAlt size={48} className="text-secondary mb-3" />
                    <h5>No locations to display</h5>
                    <p>Add a location to see it on the map</p>
                    <Button variant="primary" onClick={handleAddLocation}>
                      <FaPlus className="me-1" /> Add Location
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>

        {/* Add Location Modal */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          backdrop="static"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Location</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      {locationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Company (Optional)</Form.Label>
                    <Form.Select
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Coordinates</Form.Label>
                    <div className="row">
                      <div className="col-6">
                        <Form.Control
                          type="number"
                          placeholder="Latitude"
                          name="lat"
                          value={formData.coordinates.lat}
                          onChange={(e) =>
                            handleCoordinatesChange(
                              parseFloat(e.target.value),
                              formData.coordinates.lng
                            )
                          }
                          step="0.000001"
                          required
                        />
                      </div>
                      <div className="col-6">
                        <Form.Control
                          type="number"
                          placeholder="Longitude"
                          name="lng"
                          value={formData.coordinates.lng}
                          onChange={(e) =>
                            handleCoordinatesChange(
                              formData.coordinates.lat,
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.000001"
                          required
                        />
                      </div>
                    </div>
                  </Form.Group>

                  <p className="text-muted small">
                    Select a location on the map or enter coordinates manually.
                  </p>

                  {/* Map for selecting coordinates */}
                  <div
                    style={{
                      height: "400px",
                      width: "100%",
                      marginBottom: "1rem",
                    }}
                  >
                    <MapContainer
                      center={[
                        formData.coordinates.lat || 51.505,
                        formData.coordinates.lng || -0.09,
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          formData.coordinates.lat || 51.505,
                          formData.coordinates.lng || -0.09,
                        ]}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            handleCoordinatesChange(position.lat, position.lng);
                          },
                        }}
                      />
                      <MapClickHandler
                        onPositionSelected={handleCoordinatesChange}
                      />
                    </MapContainer>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Mark as favorite"
                      name="isFavorite"
                      checked={formData.isFavorite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFavorite: e.target.checked,
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Location
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Edit Location Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          backdrop="static"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Location</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      {locationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Company (Optional)</Form.Label>
                    <Form.Select
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Coordinates</Form.Label>
                    <div className="row">
                      <div className="col-6">
                        <Form.Control
                          type="number"
                          placeholder="Latitude"
                          name="lat"
                          value={formData.coordinates.lat}
                          onChange={(e) =>
                            handleCoordinatesChange(
                              parseFloat(e.target.value),
                              formData.coordinates.lng
                            )
                          }
                          step="0.000001"
                          required
                        />
                      </div>
                      <div className="col-6">
                        <Form.Control
                          type="number"
                          placeholder="Longitude"
                          name="lng"
                          value={formData.coordinates.lng}
                          onChange={(e) =>
                            handleCoordinatesChange(
                              formData.coordinates.lat,
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.000001"
                          required
                        />
                      </div>
                    </div>
                  </Form.Group>

                  <p className="text-muted small">
                    Select a location on the map or enter coordinates manually.
                  </p>

                  {/* Map for selecting coordinates */}
                  <div
                    style={{
                      height: "400px",
                      width: "100%",
                      marginBottom: "1rem",
                    }}
                  >
                    <MapContainer
                      center={[
                        formData.coordinates.lat || 51.505,
                        formData.coordinates.lng || -0.09,
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          formData.coordinates.lat || 51.505,
                          formData.coordinates.lng || -0.09,
                        ]}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            handleCoordinatesChange(position.lat, position.lng);
                          },
                        }}
                      />
                      <MapClickHandler
                        onPositionSelected={handleCoordinatesChange}
                      />
                    </MapContainer>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Mark as favorite"
                      name="isFavorite"
                      checked={formData.isFavorite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFavorite: e.target.checked,
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Location
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteConfirm}
          onHide={() => setShowDeleteConfirm(false)}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete this location? This action cannot
              be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteLocation}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default LocationsPage;
