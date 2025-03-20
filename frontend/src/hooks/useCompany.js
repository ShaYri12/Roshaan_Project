import { useState, useEffect } from "react";
import axios from "axios";
const dotEnv = process.env;

const useCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all companies
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${dotEnv.REACT_APP_API_URL}/companies`);
      setCompanies(response.data);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new company
  const createCompany = async (companyData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${dotEnv.REACT_APP_API_URL}/companies`,
        companyData
      );
      setCompanies([...companies, response.data]);
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Update a company
  const updateCompany = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${dotEnv.REACT_APP_API_URL}/companies/${id}`,
        updatedData
      );
      setCompanies(
        companies.map((company) =>
          company._id === id ? response.data : company
        )
      );
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a company
  const deleteCompany = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${dotEnv.REACT_APP_API_URL}/companies/${id}`);
      setCompanies(companies.filter((company) => company._id !== id));
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    error,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};

export default useCompany;
