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
      console.log("Authentication error detected, redirecting to login");

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userObj");
      localStorage.removeItem("userData");

      // Redirect to login page
      window.location.href = "/";

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

    console.log(
      `Fetching ${url} with auth: ${authToken ? "Using token" : "No token"}`
    );

    // Create the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if the token is expired
    if (response.status === 401) {
      try {
        const data = await response.json();
        if (
          data.message === "jwt expired" ||
          data.message === "Invalid token"
        ) {
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

          // Clear localStorage and redirect to login only if all attempts failed
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");

          window.location.href = "/";
          throw new Error("Authentication error. Please log in again.");
        }
      } catch (jsonError) {
        // Continue with the error handling below
      }
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

export default api;
