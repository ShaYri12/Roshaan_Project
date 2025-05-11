import React, { useState, useEffect, useCallback, memo } from "react";
import { CiLogout } from "react-icons/ci";
import { FaBars, FaShippingFast, FaCog, FaBuilding } from "react-icons/fa";
import { MdTravelExplore } from "react-icons/md";
import { BsCloudHaze2Fill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Reusable MenuItem Component
const MenuItem = ({ icon, title, isExpanded, isSidebarOpen, onToggle }) => {
  return (
    <div
      className={`nav-item px-3 py-2 d-flex align-items-center justify-content-between ${
        isExpanded ? "active" : ""
      }`}
      onClick={onToggle}
      style={{ cursor: "pointer" }}
    >
      <div
        className={`d-flex align-items-center ${
          !isSidebarOpen && "justify-content-center w-100"
        }`}
      >
        <span className="nav-icon me-0">{icon}</span>
        {isSidebarOpen && <span className="nav-text ms-2">{title}</span>}
      </div>
      {isSidebarOpen && (
        <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`}></i>
      )}
    </div>
  );
};

// SubMenuItem Component for route navigation
const NavLinkItem = ({ to, isActive, onClick, children }) => {
  return (
    <Link
      to={to}
      className={`submenu-item px-3 py-2 d-block ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

// Button SubMenuItem Component for modal triggers - memoized to prevent unnecessary re-renders
const ButtonItem = memo(({ onClick, children }) => {
  return (
    <button
      className="submenu-item px-3 py-2 d-block w-100 text-start border-0 bg-transparent"
      onClick={(e) => {
        // Stop propagation to prevent parent elements from receiving the event
        e.stopPropagation();
        onClick(e);
      }}
    >
      {children}
    </button>
  );
});

// Admin Travel & Commute Menu
const TravelAndCommuteMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<MdTravelExplore size={22} />}
        title="Travel & Commute"
        isExpanded={expandedItem === "travel"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("travel")}
      />

      {isSidebarOpen && expandedItem === "travel" && (
        <div className="submenu">
          <NavLinkItem
            to="/transport-emissions"
            isActive={isActive("/transport-emissions")}
            onClick={handleNavigation("/transport-emissions", true)}
          >
            Transport Emissions
          </NavLinkItem>
          <NavLinkItem
            to="/vehicles"
            isActive={isActive("/vehicles")}
            onClick={handleNavigation("/vehicles", true)}
          >
            Vehicles
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Greenhouse & Emissions Menu
const GreenhouseEmissionsMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<BsCloudHaze2Fill size={22} />}
        title="Greenhouse & Emissions"
        isExpanded={expandedItem === "emissions"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("emissions")}
      />

      {isSidebarOpen && expandedItem === "emissions" && (
        <div className="submenu">
          <NavLinkItem
            to="/emissions"
            isActive={isActive("/emissions")}
            onClick={handleNavigation("/emissions", true)}
          >
            Emissions
          </NavLinkItem>
          <NavLinkItem
            to="/emission-types"
            isActive={isActive("/emission-types")}
            onClick={handleNavigation("/emission-types", true)}
          >
            Emission Types
          </NavLinkItem>
          <NavLinkItem
            to="/energy-emissions"
            isActive={isActive("/energy-emissions")}
            onClick={handleNavigation("/energy-emissions", true)}
          >
            Energy Emissions
          </NavLinkItem>
          <NavLinkItem
            to="/scenarios"
            isActive={isActive("/scenarios")}
            onClick={handleNavigation("/scenarios", true)}
          >
            Scenarios
          </NavLinkItem>
          <NavLinkItem
            to="/targets"
            isActive={isActive("/targets")}
            onClick={handleNavigation("/targets", true)}
          >
            Targets
          </NavLinkItem>
          <NavLinkItem
            to="/analytics"
            isActive={isActive("/analytics")}
            onClick={handleNavigation("/analytics", true)}
          >
            Analytics
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Purchased Goods Menu
const PurchasedGoodsMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaBuilding size={22} />}
        title="Purchased Goods"
        isExpanded={expandedItem === "products"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("products")}
      />

      {isSidebarOpen && expandedItem === "products" && (
        <div className="submenu">
          <NavLinkItem
            to="/products"
            isActive={isActive("/products")}
            onClick={handleNavigation("/products", true)}
          >
            Products
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Admin Freight Transports Menu
const FreightTransportsMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaShippingFast size={22} />}
        title="Freight Transports"
        isExpanded={expandedItem === "freight"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("freight")}
      />

      {isSidebarOpen && expandedItem === "freight" && (
        <div className="submenu">
          {/* Currently no freight transport pages */}
        </div>
      )}
    </div>
  );
};

// Admin Others Menu
const OthersMenu = ({
  isSidebarOpen,
  expandedItem,
  toggleExpand,
  isActive,
  handleNavigation,
}) => {
  return (
    <div className="nav-group mb-1">
      <MenuItem
        icon={<FaCog size={22} />}
        title="Others"
        isExpanded={expandedItem === "others"}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => toggleExpand("others")}
      />

      {isSidebarOpen && expandedItem === "others" && (
        <div className="submenu">
          <NavLinkItem
            to="/companies"
            isActive={isActive("/companies")}
            onClick={handleNavigation("/companies", true)}
          >
            Company Locations
          </NavLinkItem>
          <NavLinkItem
            to="/employees"
            isActive={isActive("/employees")}
            onClick={handleNavigation("/employees", true)}
          >
            Employees
          </NavLinkItem>
          <NavLinkItem
            to="/yearly-reports"
            isActive={isActive("/yearly-reports")}
            onClick={handleNavigation("/yearly-reports", true)}
          >
            Yearly Reports
          </NavLinkItem>
          <NavLinkItem
            to="/invoices"
            isActive={isActive("/invoices")}
            onClick={handleNavigation("/invoices", true)}
          >
            Invoices
          </NavLinkItem>
          <NavLinkItem
            to="/license-plate"
            isActive={isActive("/license-plate")}
            onClick={handleNavigation("/license-plate", true)}
          >
            License Plate CO₂
          </NavLinkItem>
          <NavLinkItem
            to="/dashboard"
            isActive={isActive("/dashboard")}
            onClick={handleNavigation("/dashboard", true)}
          >
            Dashboard
          </NavLinkItem>
        </div>
      )}
    </div>
  );
};

// Employee Menu component optimized with useCallback
const EmployeeMenu = memo(
  ({
    isSidebarOpen,
    expandedItem,
    toggleExpand,
    isActive,
    handleNavigation,
  }) => {
    // Create custom event dispatchers - these don't depend on props so they're stable
    const dispatchCustomEvent = useCallback(
      (eventName) => (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent(eventName));
      },
      []
    );

    // Define all event handlers using the stable dispatchCustomEvent function
    const openTransportModal = useCallback(
      () => dispatchCustomEvent("openTransportModal"),
      [dispatchCustomEvent]
    );

    const openWorkTransportModal = useCallback(
      () => dispatchCustomEvent("openWorkTransportModal"),
      [dispatchCustomEvent]
    );

    const openVehicleModal = useCallback(
      () => dispatchCustomEvent("openVehicleModal"),
      [dispatchCustomEvent]
    );

    const openOtherResourceModal = useCallback(
      () => dispatchCustomEvent("openOtherResourceModal"),
      [dispatchCustomEvent]
    );

    const openProfileModal = useCallback(
      () => dispatchCustomEvent("openProfileModal"),
      [dispatchCustomEvent]
    );

    // This toggles the travel menu - we now include toggleExpand in dependencies
    const handleToggleTravelMenu = useCallback(() => {
      toggleExpand("travel");
    }, [toggleExpand]); // Include the dependency to fix the warning

    return (
      <div className="nav-group mb-1">
        <MenuItem
          icon={<MdTravelExplore size={22} />}
          title="Travel & Commute"
          isExpanded={expandedItem === "travel"}
          isSidebarOpen={isSidebarOpen}
          onToggle={handleToggleTravelMenu}
        />

        {isSidebarOpen && expandedItem === "travel" && (
          <div className="submenu">
            <NavLinkItem
              to="/user-dashboard"
              isActive={isActive("/user-dashboard")}
              onClick={handleNavigation("/user-dashboard", false, true)}
            >
              <i className="fas fa-tachometer-alt me-2"></i>
              My Dashboard
            </NavLinkItem>
            <ButtonItem onClick={openTransportModal}>
              <i className="fas fa-car me-2"></i>
              Add New Transport
            </ButtonItem>
            <ButtonItem onClick={openWorkTransportModal}>
              <i className="fas fa-truck me-2"></i>
              Add New Work Transport
            </ButtonItem>
            <ButtonItem onClick={openVehicleModal}>
              <i className="fas fa-plus-circle me-2"></i>
              Register Vehicle
            </ButtonItem>
            <ButtonItem onClick={openOtherResourceModal}>
              <i className="fas fa-plus me-2"></i>
              Add Other Resource
            </ButtonItem>
            <ButtonItem onClick={openProfileModal}>
              <i className="fas fa-user-edit me-2"></i>
              Profile
            </ButtonItem>
          </div>
        )}
      </div>
    );
  }
);

// Main Sidebar Component
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

  // Determine if user is admin or employee
  const isAdmin = userData?.role === "admin";
  const isEmployee = userData?.role === "employee";

  // Check if a path is active - memoized
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Toggle expanded state for menu items - memoized with stable identity
  const toggleExpand = useCallback(
    (itemName) => {
      setIsSidebarOpen(true);
      setExpandedItem((prev) => (prev === itemName ? null : itemName));
    },
    [setIsSidebarOpen]
  );

  // Enhanced link handler to prevent unauthorized navigation - memoized
  const handleNavigation = useCallback(
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
      },
    [isAdmin, isEmployee, navigate, setIsSidebarOpen]
  );

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

  // Memoized sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Handle logout with explicit stopPropagation
  const handleLogoutClick = useCallback(
    (e) => {
      e.stopPropagation();
      handleLogout();
    },
    [handleLogout]
  );

  // Handle theme toggle with explicit stopPropagation
  const handleThemeToggle = useCallback(
    (e) => {
      e.stopPropagation();
      toggleTheme();
    },
    [toggleTheme]
  );

  // Sidebar header with logo and toggle button - memoized
  const SidebarHeader = useCallback(
    () => (
      <div className="sidebar-header d-md-flex align-items-center justify-content-between">
        <button
          className={`btn sidebar-toggle d-none d-md-flex align-items-center justify-content-center ${
            isSidebarOpen ? "" : "sidebar-toggled"
          }`}
          onClick={handleSidebarToggle}
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
    ),
    [isSidebarOpen, theme, handleSidebarToggle]
  );

  // Sidebar footer with theme toggle and logout - memoized
  const SidebarFooter = useCallback(
    () => (
      <div
        className={`sidebar-footer flex-column ${isSidebarOpen ? "" : "p-2"}`}
      >
        <button
          className={`btn ${
            theme === "light" ? "btn-outline-success" : "btn-outline-light"
          } mb-2`}
          onClick={handleThemeToggle}
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
          onClick={handleLogoutClick}
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
    ),
    [isSidebarOpen, theme, handleThemeToggle, handleLogoutClick]
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-sidebar-toggle" onClick={handleSidebarToggle}>
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
        <SidebarHeader />

        <div className="sidebar-content custom-scrollbar p-0">
          <nav className="sidebar-nav">
            {isAdmin ? (
              <>
                {/* ADMIN MENU */}
                <TravelAndCommuteMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <GreenhouseEmissionsMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <PurchasedGoodsMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
                <FreightTransportsMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                />
                <OthersMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
              </>
            ) : (
              <>
                {/* EMPLOYEE MENU */}
                <EmployeeMenu
                  isSidebarOpen={isSidebarOpen}
                  expandedItem={expandedItem}
                  toggleExpand={toggleExpand}
                  isActive={isActive}
                  handleNavigation={handleNavigation}
                />
              </>
            )}
          </nav>
        </div>

        <SidebarFooter />
      </div>
    </>
  );
};

export default Sidebar;
