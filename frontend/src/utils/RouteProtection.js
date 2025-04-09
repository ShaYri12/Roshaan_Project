import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * AdminRoute - Protects routes that should only be accessible by admins
 * Redirects employees to their dashboard
 */
export const AdminRoute = ({ children }) => {
  const location = useLocation();

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
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

/**
 * EmployeeRoute - Protects routes that should only be accessible by employees
 * Redirects admins to their dashboard
 */
export const EmployeeRoute = ({ children }) => {
  const location = useLocation();

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
  const userStr = localStorage.getItem("userObj");
  if (!userStr) {
    // Not logged in, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check user role
  try {
    const user = JSON.parse(userStr);
    console.log("User object for employee check:", user);

    // Check if the user is an employee
    // An employee has firstName, lastName, homeAddress, car properties
    // Or if role is explicitly set to 'employee'
    const isEmployee =
      (user &&
        user.firstName &&
        user.lastName &&
        (user.car || user.homeAddress)) ||
      (user && user.role === "employee");

    console.log("Is Employee check result:", isEmployee);

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
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Invalid user data, redirect to login
    localStorage.removeItem("userObj");
    localStorage.removeItem("token");
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

/**
 * AuthRoute - Ensures user is authenticated but doesn't enforce role
 * Used for routes that both admin and employees can access
 */
export const AuthRoute = ({ children }) => {
  const location = useLocation();

  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated, allow access
  return children;
};
