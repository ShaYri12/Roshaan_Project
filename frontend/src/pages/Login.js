import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";

const LoginPage = () => {
  const [email, setEmail] = useState("ethan.williams@example.com");
  const [password, setPassword] = useState("P@ssw0rd123");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${REACT_APP_API_URL}/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response?.ok) {
        alert("Invalid credentials");
      }
      const data = await response?.json();
      console.log(data, "dtaa");
      localStorage.setItem("userData", JSON.stringify(data.user));

      if (data?.role === "admin") {
        localStorage.setItem("userObj", JSON.stringify(data?.user));
        localStorage.setItem("token", data.jwtToken);
        navigate("/dashboard");
      } else if (data?.role === "employee") {
        console.log(data);
        localStorage.setItem("userObj", JSON.stringify(data?.user));
        localStorage.setItem("token", data?.jwtToken);
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
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
                    type={passwordVisible ? "text" : "password"} // Toggle input type
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password && ( // Only show eye icon if password is not empty
                    <span
                      onClick={togglePassword} // Toggle password visibility
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
                  <button type="submit" className="btn btn-primary w-50">
                    Login
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
