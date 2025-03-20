import React from "react";
import ReactDOM from "react-dom/client"; // Updated import for React 18+
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./assets/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // Create root for React 18+
root.render(
  <Router>
    <App />
  </Router>
);
