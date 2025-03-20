import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Employees from "./pages/Employees";
import Companies from "./pages/Companies";
import Emissions from "./pages/Emissions";
import Registration from "./pages/Registration";
import EmissionTypesPage from "./pages/EmissionTypes";
import EnergyEmissions from "./pages/EnergyEmissions";
import TransportEmissions from "./pages/TransportEmissions";
import VehiclePage from "./pages/Vehicles";
import VehicleRegisterPage from "./pages/VehicleRegister";
import "./assets/style.css";

const App = () => {
  // Initialize theme from localStorage on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.className = `${savedTheme}-theme`;
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employee-details/:id" element={<UserDashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/emissions" element={<Emissions />} />
        <Route path="/emission-types" element={<EmissionTypesPage />} />
        <Route path="/energy-emissions" element={<EnergyEmissions />} />
        <Route path="/transport-emissions" element={<TransportEmissions />} />
        <Route path="/vehicles" element={<VehiclePage />} />
        <Route path="/vehicle-register" element={<VehicleRegisterPage />} />
      </Routes>
    </div>
  );
};

export default App;
