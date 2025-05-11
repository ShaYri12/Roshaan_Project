import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { REACT_APP_API_URL } from "../env";

/**
 * Helper function to verify token validity
 * @returns {boolean} - True if the token is valid, false otherwise
 */
const verifyToken = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const response = await fetch(`${REACT_APP_API_URL}/auth/validate-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      // Check if token is expired
      if (
        data.message === "jwt expired" ||
        data.message === "Invalid token" ||
        data.message === "Token verification failed: jwt expired"
      ) {
        console.log("Token expired, redirecting to login");
        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("userObj");
        localStorage.removeItem("userData");
        return false;
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
};

/**
 * AdminRoute - Protects routes that should only be accessible by admins
 * Redirects employees to their dashboard
 */
export const AdminRoute = ({ children }) => {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const isValidToken = await verifyToken();
      setIsAuthenticated(isValidToken);
      setIsVerifying(false);
    };

    checkToken();
  }, []);

  // Show nothing while verifying to prevent flash of login page
  if (isVerifying) {
    return null;
  }

  // If token is invalid or expired, redirect to login
  if (!isAuthenticated) {
    // Not logged in or token expired, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is logged in
  const userStr = localStorage.getItem("userObj");
  if (!userStr) {
    // Not logged in, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check user role
  try {
    const user = JSON.parse(userStr);

    // Check if user is an admin - simply check for role === "admin"
    const isAdmin = user && user.role === "admin";

    if (isAdmin) {
      // User is admin, allow access
      return children;
    } else {
      // User is not admin, redirect to employee dashboard
      console.log("Non-admin tried to access admin route, redirecting");
      // Add a flag to prevent infinite loops
      return (
        <Navigate
          to="/user-dashboard"
          state={{ from: location, isRedirected: true }}
          replace
        />
      );
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Invalid user data, redirect to login
    localStorage.removeItem("userObj");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

/**
 * EmployeeRoute - Protects routes that should only be accessible by employees
 * Redirects admins to their dashboard
 */
export const EmployeeRoute = ({ children }) => {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const isValidToken = await verifyToken();
      setIsAuthenticated(isValidToken);
      setIsVerifying(false);
    };

    checkToken();
  }, []);

  // Show nothing while verifying to prevent flash of login page
  if (isVerifying) {
    return null;
  }

  // If token is invalid or expired, redirect to login
  if (!isAuthenticated) {
    // Not logged in or token expired, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if this is a redirect from another protected route to prevent loops
  if (location.state && location.state.isRedirected) {
    // If we're coming from a redirect, just show an error message instead of redirecting again
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You don't have permission to access this page.</p>
          <hr />
          <p className="mb-0">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  let user = null;
  try {
    const userStr = localStorage.getItem("userObj");
    if (!userStr) {
      // Not logged in, redirect to login
      return <Navigate to="/" state={{ from: location }} replace />;
    }

    user = JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Invalid user data, redirect to login
    localStorage.removeItem("userObj");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check user role - simplified check to prevent re-renders
  const isEmployee =
    user && (user.role === "employee" || (user.firstName && user.lastName));

  if (isEmployee) {
    // User is employee, allow access
    return children;
  } else {
    // User is not employee, redirect to admin dashboard
    console.log("Non-employee tried to access employee route, redirecting");
    return (
      <Navigate
        to="/dashboard"
        state={{ from: location, isRedirected: true }}
        replace
      />
    );
  }
};

/**
 * AuthRoute - Ensures user is authenticated but doesn't enforce role
 * Used for routes that both admin and employees can access
 */
export const AuthRoute = ({ children }) => {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const isValidToken = await verifyToken();
      setIsAuthenticated(isValidToken);
      setIsVerifying(false);
    };

    checkToken();
  }, []);

  // Show nothing while verifying to prevent flash of login page
  if (isVerifying) {
    return null;
  }

  // If token is invalid or expired, redirect to login
  if (!isAuthenticated) {
    // Not logged in or token expired, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated, allow access
  return children;
};
