import React from "react";
import ReactDOM from "react-dom/client"; // Updated import for React 18+
import {
  BrowserRouter as Router,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import "./assets/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Create router with future flags to silence warnings
const router = createBrowserRouter(
  [
    {
      path: "*",
      element: <App />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const root = ReactDOM.createRoot(document.getElementById("root")); // Create root for React 18+
root.render(<RouterProvider router={router} />);
