import React, { useEffect } from "react";
import { CiLogout } from "react-icons/ci";
import { FaBars } from "react-icons/fa";

const Sidebar = ({
  userData,
  theme,
  toggleTheme,
  handleLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
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

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button
            className={`btn btn-link sidebar-toggle d-none d-md-flex align-items-center justify-content-center ${
              isSidebarOpen ? "" : "sidebar-toggled"
            }`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
          <div className={`welcome-section ${isSidebarOpen ? "" : "d-none"}`}>
            <span
              className="d-block"
              style={{ fontSize: "1.2rem", fontWeight: "bold" }}
            >
              Welcome,{" "}
              <span className="text-primary">
                {userData?.firstName} {userData?.lastName}
              </span>
            </span>
            <span
              className="d-block"
              style={{ fontSize: "0.9rem", fontStyle: "italic" }}
            >
              It's a great day to be productive! ✨
            </span>
          </div>
        </div>

        <div className="sidebar-content"></div>

        <div
          className={`sidebar-footer flex-column ${isSidebarOpen ? "" : "p-2"}`}
        >
          <button
            className={`btn ${
              theme === "light" ? "btn-outline-dark" : "btn-outline-light"
            }`}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun"></i>
            )}
          </button>
          <button
            className={`btn btn-outline-danger ${isSidebarOpen ? "" : "px-1"}`}
            onClick={handleLogout}
          >
            {isSidebarOpen ? "Logout" : <CiLogout size={24} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
