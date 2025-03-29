import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { GoTrophy } from "react-icons/go";
import { FaUser, FaExclamationTriangle } from "react-icons/fa";
import { REACT_APP_API_URL } from "../env";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear; i++) {
    years.push(i);
  }

  useEffect(() => {
    fetchEmissionsData();
  }, [month, year]);

  const fetchEmissionsData = async () => {
    setLoading(true);
    try {
      // Create date filters for API requests
      let dateFilter = {};
      if (month && year) {
        const startDate = new Date(year, month - 1, 1); // Month is 0-based in JS Date
        const endDate = new Date(year, month, 0); // Last day of the month
        dateFilter = { startDate, endDate };
      } else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        dateFilter = { startDate, endDate };
      }

      // Fetch all emissions data from the emissions endpoint
      const response = await axios.get(`${REACT_APP_API_URL}/emissions`, {
        params: {
          global: true, // Get all emissions globally
        },
        withCredentials: true,
      });

      // Process the emissions data to calculate the leaderboard
      const leaderboardData = calculateLeaderboard(
        response.data || [],
        dateFilter
      );

      if (leaderboardData.length === 0) {
        setLeaderboardData([]);
        setError("No emissions data found for the selected period.");
      } else {
        setLeaderboardData(leaderboardData);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching emissions data:", err);
      if (err.response) {
        setError(
          `Server error: ${
            err.response.data?.message || "Failed to load emissions data"
          }`
        );
      } else if (err.request) {
        setError(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      } else {
        setError("Failed to load emissions data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate leaderboard data from emissions
  const calculateLeaderboard = (emissions, dateFilter) => {
    // Map to store emissions by user
    const userEmissionsMap = new Map();

    // Process emissions
    emissions.forEach((emission) => {
      // Apply date filter if needed
      if (dateFilter.startDate && dateFilter.endDate) {
        const emissionDate = new Date(emission.date);
        if (
          emissionDate < dateFilter.startDate ||
          emissionDate > dateFilter.endDate
        ) {
          return; // Skip this emission if outside date range
        }
      }

      if (!emission.employee || !emission.employee._id) return;

      const userId = emission.employee._id;
      const userName = `${emission.employee.firstName || ""} ${
        emission.employee.lastName || ""
      }`.trim();
      const co2Used = parseFloat(emission.co2Used || 0);

      // Get or create user entry in map
      if (!userEmissionsMap.has(userId)) {
        userEmissionsMap.set(userId, {
          userId,
          firstName: emission.employee.firstName || "Unknown",
          lastName: emission.employee.lastName || "User",
          name: userName || "Unknown User",
          totalEmissions: 0,
          emissionCount: 0,
        });
      }

      // Update user's emissions
      const userData = userEmissionsMap.get(userId);
      userData.totalEmissions += co2Used;
      userData.emissionCount += 1;
    });

    // Convert to array and calculate averages
    const result = Array.from(userEmissionsMap.values()).map((user) => ({
      ...user,
      totalEmissions: parseFloat(user.totalEmissions.toFixed(2)),
      averageEmission:
        user.emissionCount > 0
          ? parseFloat((user.totalEmissions / user.emissionCount).toFixed(2))
          : 0,
    }));

    // Sort by lowest emissions (most eco-friendly first)
    result.sort((a, b) => a.totalEmissions - b.totalEmissions);

    // Add rankings
    return result.map((user, index) => ({
      ...user,
      rank: index + 1,
      key: user.userId,
    }));
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value === "" ? null : parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  // Function to render rank with trophy
  const renderRank = (rank) => {
    let iconColor = "";
    let textColor = "";

    if (rank === 1) {
      iconColor = "gold";
      textColor = "gold";
    } else if (rank === 2) {
      iconColor = "silver";
      textColor = "silver";
    } else if (rank === 3) {
      iconColor = "#cd7f32"; // bronze
      textColor = "#cd7f32";
    }

    return (
      <span
        style={{ fontWeight: rank <= 3 ? "bold" : "normal", color: textColor }}
      >
        {rank <= 3 && <GoTrophy style={{ color: iconColor, marginRight: 8 }} />}
        {rank}
      </span>
    );
  };

  // Function to render name with user icon and badge
  const renderName = (name, rank) => (
    <span>
      {name}
      {rank <= 3 && (
        <span className="badge bg-success ms-2" style={{ fontSize: "0.75rem" }}>
          Top Performer
        </span>
      )}
    </span>
  );

  // Function to format numbers with commas
  const formatNumber = (value) => value.toLocaleString();

  const renderTable = () => {
    if (leaderboardData.length === 0) {
      return (
        <div className="text-center py-5">
          <FaExclamationTriangle
            className="mb-3"
            style={{ fontSize: "2rem", color: "#ffc107" }}
          />
          <p className="mb-0">
            No emissions data available for the selected period.
          </p>
          <p className="text-muted">Try selecting a different month or year.</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col" style={{ width: "80px" }}>
                Rank
              </th>
              <th scope="col" style={{ minWidth: "150px" }}>
                Name
              </th>
              <th scope="col">Total Emissions (kg CO2)</th>
              <th scope="col">Number of Entries</th>
              <th scope="col">Average per Entry (kg CO2)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user) => (
              <tr
                key={user.userId}
                className={
                  user.rank === 1
                    ? "leaderboard-first"
                    : user.rank === 2
                    ? "leaderboard-second"
                    : user.rank === 3
                    ? "leaderboard-third"
                    : ""
                }
              >
                <td>{renderRank(user.rank)}</td>
                <td>{renderName(user.name, user.rank)}</td>
                <td>{formatNumber(user.totalEmissions)}</td>
                <td>{user.emissionCount}</td>
                <td>{formatNumber(user.averageEmission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="card m-0 p-0 leaderboard-card mb-4 shadow-sm">
      <div className="card-body">
        <div className="d-flex mb-3 align-items-center justify-content-between flex-wrap gap-3">
          <div className="">
            <h4 className="card-title text-start mb-0">
              <GoTrophy style={{ color: "#1890ff", marginRight: 10 }} />
              Conservation Leaders{" "}
              <span className="text-success fs-6 ms-2 fw-normal">
                Lowest CO₂ Emissions
              </span>
            </h4>
          </div>
          <div className="">
            <div className="d-flex justify-content-md-end">
              <div className="me-2">
                <select
                  className="form-select"
                  onChange={handleMonthChange}
                  value={month || ""}
                >
                  <option value="">All Months</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="form-select"
                  onChange={handleYearChange}
                  value={year}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="alert alert-warning" role="alert">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2" />
              <span>{error}</span>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
