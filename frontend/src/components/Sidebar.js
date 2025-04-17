import React, { useState, useEffect } from "react";
import { CiLogout } from "react-icons/ci";
import { FaBars, FaShippingFast, FaCog, FaBuilding } from "react-icons/fa";
import { MdTravelExplore } from "react-icons/md";
import { BsCloudHaze2Fill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({
  userData,
  theme,
  toggleTheme,
  handleLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState(null);

  // Determine if user is admin
  const isAdmin = userData?.role === "admin";
  const isEmployee = userData?.role === "employee";

  // Check if a path is active
  const isActive = (path) => location.pathname === path;

  // Toggle expanded state for menu items
  const toggleExpand = (itemName) => {
    setIsSidebarOpen(true);
    if (expandedItem === itemName) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemName);
    }
  };

  // Enhanced link handler to prevent unauthorized navigation
  const handleNavigation =
    (path, requiresAdmin = false, requiresEmployee = false) =>
    (e) => {
      // Clear any previous unauthorized message
      setUnauthorizedMessage(null);

      // Check access permissions
      if (requiresAdmin && !isAdmin) {
        e.preventDefault();
        setUnauthorizedMessage(
          "You don't have permission to access the admin area"
        );
        setTimeout(() => setUnauthorizedMessage(null), 3000);
        return;
      }

      if (requiresEmployee && !isEmployee) {
        e.preventDefault();
        setUnauthorizedMessage(
          "You don't have permission to access the employee area"
        );
        setTimeout(() => setUnauthorizedMessage(null), 3000);
        return;
      }

      // Navigation is allowed
      navigate(path);

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    };

  // Close sidebar on mobile devices when the component mounts
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FaBars />
      </button>

      {/* Unauthorized Message Alert */}
      {unauthorizedMessage && (
        <div className="unauthorized-alert">
          <div className="alert alert-danger" role="alert">
            {unauthorizedMessage}
          </div>
        </div>
      )}

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header d-md-flex align-items-center justify-content-between">
          <button
            className={`btn sidebar-toggle d-none d-md-flex align-items-center justify-content-center ${
              isSidebarOpen ? "" : "sidebar-toggled"
            }`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
          <div
            className={`welcome-section mt-md-0 mt-4 ${
              isSidebarOpen ? "" : "d-none"
            }`}
          >
            <div className="sidebar-header-logo">
              {theme === "light" ? (
                <img
                  src="/logo-black.png"
                  alt="Logo"
                  width={128}
                  height={71.41}
                />
              ) : (
                <img
                  src="/logo-white.png"
                  alt="Logo"
                  width={128}
                  height={71.41}
                />
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-content custom-scrollbar p-0">
          <nav className="sidebar-nav">
            {isAdmin ? (
              <>
                {/* ADMIN MENU - 5 buttons */}

                {/* 1. Travel & Commute */}
                <div className="nav-group mb-1">
                  <div
                    className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
                      expandedItem === "travel" ? "active" : ""
                    }`}
                    onClick={() => toggleExpand("travel")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`d-flex align-items-center ${
                        !isSidebarOpen && "justify-content-center w-100"
                      }`}
                    >
                      <span className="nav-icon me-0">
                        <MdTravelExplore size={22} />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-text ms-2">Travel & Commute</span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <i
                        className={`fas fa-chevron-${
                          expandedItem === "travel" ? "up" : "down"
                        }`}
                      ></i>
                    )}
                  </div>

                  {isSidebarOpen && expandedItem === "travel" && (
                    <div className="submenu">
                      <Link
                        to="/transport-emissions"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/transport-emissions") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/transport-emissions", true)}
                      >
                        Transport Emissions
                      </Link>
                      <Link
                        to="/vehicles"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/vehicles") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/vehicles", true)}
                      >
                        Vehicles
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Greenhouse & Emissions */}
                <div className="nav-group mb-1">
                  <div
                    className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
                      expandedItem === "emissions" ? "active" : ""
                    }`}
                    onClick={() => toggleExpand("emissions")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`d-flex align-items-center ${
                        !isSidebarOpen && "justify-content-center w-100"
                      }`}
                    >
                      <span className="nav-icon me-0">
                        <BsCloudHaze2Fill size={22} />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-text ms-2">
                          Greenhouse & Emissions
                        </span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <i
                        className={`fas fa-chevron-${
                          expandedItem === "emissions" ? "up" : "down"
                        }`}
                      ></i>
                    )}
                  </div>

                  {isSidebarOpen && expandedItem === "emissions" && (
                    <div className="submenu">
                      <Link
                        to="/emissions"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/emissions") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/emissions", true)}
                      >
                        Emissions
                      </Link>
                      <Link
                        to="/emission-types"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/emission-types") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/emission-types", true)}
                      >
                        Emission Types
                      </Link>
                      <Link
                        to="/energy-emissions"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/energy-emissions") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/energy-emissions", true)}
                      >
                        Energy Emissions
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Purchased Goods */}
                <div className="nav-group mb-1">
                  <div
                    className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
                      expandedItem === "products" ? "active" : ""
                    }`}
                    onClick={() => toggleExpand("products")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`d-flex align-items-center ${
                        !isSidebarOpen && "justify-content-center w-100"
                      }`}
                    >
                      <span className="nav-icon me-0">
                        <FaBuilding size={22} />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-text ms-2">Purchased Goods</span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <i
                        className={`fas fa-chevron-${
                          expandedItem === "products" ? "up" : "down"
                        }`}
                      ></i>
                    )}
                  </div>

                  {isSidebarOpen && expandedItem === "products" && (
                    <div className="submenu">
                      <Link
                        to="/products"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/products") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/products", true)}
                      >
                        Products
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Freight Transports */}
                <div className="nav-group mb-1">
                  <div
                    className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
                      expandedItem === "freight" ? "active" : ""
                    }`}
                    onClick={() => toggleExpand("freight")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`d-flex align-items-center ${
                        !isSidebarOpen && "justify-content-center w-100"
                      }`}
                    >
                      <span className="nav-icon me-0">
                        <FaShippingFast size={22} />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-text ms-2">
                          Freight Transports
                        </span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <i
                        className={`fas fa-chevron-${
                          expandedItem === "freight" ? "up" : "down"
                        }`}
                      ></i>
                    )}
                  </div>

                  {isSidebarOpen && expandedItem === "freight" && (
                    <div className="submenu">
                      {/* Currently no freight transport pages */}
                    </div>
                  )}
                </div>

                {/* 5. Others */}
                <div className="nav-group mb-1">
                  <div
                    className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
                      expandedItem === "others" ? "active" : ""
                    }`}
                    onClick={() => toggleExpand("others")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`d-flex align-items-center ${
                        !isSidebarOpen && "justify-content-center w-100"
                      }`}
                    >
                      <span className="nav-icon me-0">
                        <FaCog size={22} />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-text ms-2">Others</span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <i
                        className={`fas fa-chevron-${
                          expandedItem === "others" ? "up" : "down"
                        }`}
                      ></i>
                    )}
                  </div>

                  {isSidebarOpen && expandedItem === "others" && (
                    <div className="submenu">
                      <Link
                        to="/companies"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/companies") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/companies", true)}
                      >
                        Company Locations
                      </Link>
                      <Link
                        to="/employees"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/employees") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/employees", true)}
                      >
                        Employees
                      </Link>
                      <Link
                        to="/yearly-reports"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/yearly-reports") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/yearly-reports", true)}
                      >
                        Yearly Reports
                      </Link>
                      <Link
                        to="/invoices"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/invoices") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/invoices", true)}
                      >
                        Invoices
                      </Link>
                      <Link
                        to="/license-plate"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/license-plate") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/license-plate", true)}
                      >
                        License Plate CO₂
                      </Link>
                      <Link
                        to="/dashboard"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/dashboard") ? "active" : ""
                        }`}
                        onClick={handleNavigation("/dashboard", true)}
                      >
                        Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* EMPLOYEE MENU - Single button */}
                <div className="nav-group mb-1">
                  <div
                    className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
                      expandedItem === "travel" ? "active" : ""
                    }`}
                    onClick={() => toggleExpand("travel")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className={`d-flex align-items-center ${
                        !isSidebarOpen && "justify-content-center w-100"
                      }`}
                    >
                      <span className="nav-icon me-0">
                        <MdTravelExplore size={22} />
                      </span>
                      {isSidebarOpen && (
                        <span className="nav-text ms-2">Travel & Commute</span>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <i
                        className={`fas fa-chevron-${
                          expandedItem === "travel" ? "up" : "down"
                        }`}
                      ></i>
                    )}
                  </div>

                  {isSidebarOpen && expandedItem === "travel" && (
                    <div className="submenu">
                      <Link
                        to="/user-dashboard"
                        className={`submenu-item px-3 py-2 d-block ${
                          isActive("/user-dashboard") ? "active" : ""
                        }`}
                        onClick={handleNavigation(
                          "/user-dashboard",
                          false,
                          true
                        )}
                      >
                        <i className="fas fa-tachometer-alt me-2"></i>
                        My Dashboard
                      </Link>
                      <button
                        className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
                        onClick={() => {
                          const event = new CustomEvent("openTransportModal");
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-car me-2"></i>
                        Add New Transport
                      </button>
                      <button
                        className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
                        onClick={() => {
                          const event = new CustomEvent(
                            "openWorkTransportModal"
                          );
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-truck me-2"></i>
                        Add New Work Transport
                      </button>
                      <button
                        className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
                        onClick={() => {
                          const event = new CustomEvent("openVehicleModal");
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-plus-circle me-2"></i>
                        Register Vehicle
                      </button>
                      <button
                        className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
                        onClick={() => {
                          const event = new CustomEvent(
                            "openOtherResourceModal"
                          );
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Add Other Resource
                      </button>
                      <button
                        className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
                        onClick={() => {
                          const event = new CustomEvent("openProfileModal");
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-user-edit me-2"></i>
                        Profile
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>
        </div>

        <div
          className={`sidebar-footer flex-column ${isSidebarOpen ? "" : "p-2"}`}
        >
          <button
            className={`btn ${
              theme === "light" ? "btn-outline-success" : "btn-outline-light"
            } mb-2`}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun"></i>
            )}
            {isSidebarOpen && <span className="ms-2">Toggle Theme</span>}
          </button>
          <button
            className={`btn btn-outline-danger ${isSidebarOpen ? "" : "px-1"}`}
            onClick={handleLogout}
          >
            {isSidebarOpen ? (
              <>
                <CiLogout size={24} className="me-2" /> Logout
              </>
            ) : (
              <CiLogout size={24} />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
