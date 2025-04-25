import axios from "axios";
import { REACT_APP_API_URL } from "../env";

// Create a custom axios instance
const api = axios.create({
  baseURL: REACT_APP_API_URL,
});

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response, // Return success responses as-is
  (error) => {
    const originalRequest = error.config;

    // Handle expired JWT or authentication error
    if (
      (error.response && error.response.status === 401) ||
      (error.response &&
        error.response.data &&
        (error.response.data.message === "jwt expired" ||
          error.response.data.message === "Invalid token" ||
          error.response.data.message ===
            "Token verification failed: jwt expired"))
    ) {
      console.log("Authentication error detected");

      // Set auth error flag
      localStorage.setItem("auth_error", "true");

      // Clear tokens but keep other data for now
      localStorage.removeItem("token");

      // Only redirect if we're not in the middle of rendering a component
      // This helps prevent React errors during rendering
      if (!error.config._isRetry) {
        // Use setTimeout to ensure we're outside React rendering cycle
        setTimeout(() => {
          // Check if we already handled this auth error
          if (localStorage.getItem("auth_error") === "true") {
            // Clear all auth data
            localStorage.removeItem("userObj");
            localStorage.removeItem("userData");
            localStorage.removeItem("auth_error");

            // Redirect to login page
            window.location.href = "/";
          }
        }, 300);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Function to set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Helper function to create authenticated fetch request
export const authenticatedFetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const JWT_ADMIN_SECRET =
      localStorage.getItem("JWT_ADMIN_SECRET") ||
      (typeof JWT_ADMIN_SECRET !== "undefined" ? JWT_ADMIN_SECRET : null);

    // Special handling for emissions endpoints - prefer JWT_ADMIN_SECRET
    const isEmissionsEndpoint = url.includes("/emissions");

    // Use token or fall back to JWT_ADMIN_SECRET
    // For emissions endpoints, prioritize using JWT_ADMIN_SECRET
    const authToken = isEmissionsEndpoint
      ? JWT_ADMIN_SECRET || token
      : token || JWT_ADMIN_SECRET;

    // Set default headers
    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    };

    // Create the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if the token is expired
    if (response.status === 401) {
      let isTokenExpired = false;

      try {
        const data = await response.json();
        if (
          data.message === "jwt expired" ||
          data.message === "Invalid token" ||
          data.message === "Token verification failed: jwt expired"
        ) {
          isTokenExpired = true;

          // If normal token failed and we have JWT_ADMIN_SECRET, try with that instead
          if (token && JWT_ADMIN_SECRET && token !== JWT_ADMIN_SECRET) {
            console.log("Retrying with admin secret");
            // Create new headers with admin secret
            const adminHeaders = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
              ...options.headers,
            };

            // Retry the request with admin secret
            const adminResponse = await fetch(url, {
              ...options,
              headers: adminHeaders,
            });

            if (adminResponse.ok) {
              return adminResponse;
            }
          }

          // Instead of immediately redirecting, throw a specific error type
          // that component can catch and handle appropriately
          const authError = new Error("Authentication token expired");
          authError.isAuthError = true;
          throw authError;
        }
      } catch (jsonError) {
        // If we identified token expiration earlier, handle appropriately
        if (isTokenExpired) {
          // Clear token but don't redirect - let components handle it
          localStorage.removeItem("token");

          // Return a special error that components can check for
          const authError = new Error("Authentication token expired");
          authError.isAuthError = true;
          throw authError;
        }
        // Otherwise, continue with the error handling below
      }
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    // Pass through auth errors so they can be handled by components
    if (error.isAuthError) {
      throw error;
    }

    console.error("Request failed:", error);
    throw error;
  }
};

export default api;
