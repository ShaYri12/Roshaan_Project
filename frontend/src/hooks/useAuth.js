import { useState, useEffect } from "react";
import axios from "axios";
const dotEnv = process.env;

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Register a user
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${dotEnv.REACT_APP_API_URL}/auth/register`,
        userData
      );
      setUser(response.data);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Login a user
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${dotEnv.REACT_APP_API_URL}/auth/`,
        credentials
      );
      setUser(response.data);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout a user
  const logout = () => {
    setUser(null);
  };

  return {
    user,
    error,
    loading,
    register,
    login,
    logout,
  };
};

export default useAuth;
