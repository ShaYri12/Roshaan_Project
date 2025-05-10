import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../../env";

// Function to get userId from multiple locations
export const getUserId = (userData) => {
  let userId = null;

  // First try userObj in localStorage
  try {
    const userObjStr = localStorage.getItem("userObj");
    if (userObjStr) {
      const userObj = JSON.parse(userObjStr);
      // Check for both id and _id formats
      userId = userObj._id || userObj.id;
    }
  } catch (e) {
    console.error("Error getting user ID from userObj:", e);
  }

  // Then try userData in localStorage if userObj failed
  if (!userId) {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userDataObj = JSON.parse(userDataStr);
        // Check for both id and _id formats
        userId = userDataObj._id || userDataObj.id;
      }
    } catch (e) {
      console.error("Error getting user ID from userData:", e);
    }
  }

  // Use userData state as fallback
  if (!userId && userData) {
    // Check for both id and _id formats in userData state
    userId = userData._id || userData.id;
  }

  // Final fallback for development
  if (!userId) {
    // This is for development only - in production, throw an error
    userId = "6624c7ab8a89c9f76ded3d9e"; // Default test ID
    console.warn("Using default user ID for development:", userId);
  }

  return userId;
};

// Function to fetch reports for a user
export const fetchSavedReports = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    if (!userId) {
      throw new Error("No user ID provided");
    }

    const response = await fetch(
      `${REACT_APP_API_URL}/yearly-reports?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      console.warn("Failed to fetch reports:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    return [];
  }
};

// Function to fetch or generate a report
export const fetchOrGenerateReport = async (year, userId) => {
  try {
    const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

    // First check if a report already exists for this year
    const checkResponse = await fetch(
      `${REACT_APP_API_URL}/yearly-reports/year/${year}?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // If report exists, return it
    if (checkResponse.ok) {
      return await checkResponse.json();
    }

    // If no existing report, generate a new one
    const response = await fetch(`${REACT_APP_API_URL}/yearly-reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        year: year,
        userId: userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error generating report: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error in fetchOrGenerateReport:", error);
    throw error;
  }
};

// Function to load an existing report by ID
export const loadReportById = async (reportId) => {
  try {
    const token = localStorage.getItem("token");
    console.log(`Loading report with ID: ${reportId}`);

    const response = await fetch(
      `${REACT_APP_API_URL}/yearly-reports/${reportId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      // Try to get the error message from the response body
      let errorMessage = `Error loading report: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = `Error loading report: ${errorData.message}`;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in loadReportById:", error);
    throw error;
  }
};

// Function to delete a report
export const deleteReportById = async (reportId) => {
  try {
    console.log("Attempting to delete report with ID:", reportId);
    const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

    const response = await fetch(
      `${REACT_APP_API_URL}/yearly-reports/${reportId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Delete response status:", response.status);

    let errorMessage = "";
    try {
      // Try to parse response as JSON
      const responseData = await response.json();
      console.log("Delete response data:", responseData);

      if (!response.ok) {
        errorMessage =
          responseData.message ||
          responseData.error ||
          `Server returned ${response.status}`;
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (parseError) {
      // If we can't parse JSON, use the status text
      if (!response.ok) {
        errorMessage = `Error deleting report: ${response.statusText} (${response.status})`;
        throw new Error(errorMessage);
      }
      return { success: true };
    }
  } catch (error) {
    console.error("Error in deleteReportById:", error);
    throw error;
  }
};
