import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { REACT_APP_API_URL } from "../env";

const LoginPage = () => {
  const [email, setEmail] = useState("ethan.williams@example.com");
  const [password, setPassword] = useState("P@ssw0rd123");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Get theme from localStorage
  const theme = localStorage.getItem("theme") || "light";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${REACT_APP_API_URL}/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response?.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${errorText}`);
      }

      const data = await response?.json();
      console.log("Login successful:", data);

      // Clear any old authentication data first
      localStorage.removeItem("token");
      localStorage.removeItem("userObj");
      localStorage.removeItem("userData");

      // Store user data consistently
      if (data?.user) {
        // Ensure we store the full user object
        localStorage.setItem("userObj", JSON.stringify(data.user));

        // For backward compatibility
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      // Always store the token if provided
      if (data?.jwtToken) {
        localStorage.setItem("token", data.jwtToken);

        // Also set the token for axios calls
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.jwtToken}`;
      }

      // Navigate based on role
      if (data?.role === "admin") {
        navigate("/dashboard");
      } else if (data?.role === "employee") {
        navigate("/user-dashboard");
      } else {
        // Default navigation if role is not specified
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setError(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="text-center mb-4">
                <img
                  src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
                  alt="Logo"
                  width={150}
                  height={84}
                  className="mb-3"
                />
                <h2 className="card-title">Login</h2>
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label className="form-label">Password</label>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password && (
                    <span
                      onClick={togglePassword}
                      className="cursorPointer position-absolute top-62 end-0 translate-middle-y me-3"
                    >
                      {passwordVisible ? (
                        <FaEyeSlash size={15} />
                      ) : (
                        <FaEye size={15} />
                      )}
                    </span>
                  )}
                </div>
                <div className="text-center mt-3">
                  <p>
                    Don't have an account{" "}
                    <Link to="/register" className="regButton">
                      Register
                    </Link>
                  </p>
                </div>
                <div className="d-flex justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-success w-50"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
