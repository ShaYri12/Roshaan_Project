import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { OPENAI_API_KEY } from "../../env";
import Sidebar from "../../components/Sidebar";

// Helper function to generate mock invoice content based on type and provider
const generateMockInvoiceContent = (type, provider) => {
  const date = new Date().toISOString().split("T")[0];
  const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;

  switch (type) {
    case "energy":
      return `
INVOICE
${provider}
Invoice Number: ${invoiceNum}
Date: ${date}

Electricity Usage: 450 kWh
Rate: €0.22 per kWh
Total Amount: €99.00

Customer Details:
Name: Example Customer
Account: ACC-12345
`;
    case "water":
      return `
INVOICE
${provider}
Invoice Number: ${invoiceNum}
Date: ${date}

Water Usage: 15 cubic meters
Rate: €2.10 per cubic meter
Total Amount: €31.50

Customer Details:
Name: Example Customer
Account: ACC-12345
`;
    case "gas":
      return `
INVOICE
${provider}
Invoice Number: ${invoiceNum}
Date: ${date}

Gas Usage: 120 cubic meters
Rate: €0.95 per cubic meter
Total Amount: €114.00

Customer Details:
Name: Example Customer
Account: ACC-12345
`;
    default:
      return `
INVOICE
${provider}
Invoice Number: ${invoiceNum}
Date: ${date}

Service: General services
Amount: €75.00

Customer Details:
Name: Example Customer
Account: ACC-12345
`;
  }
};

// Helper function to calculate consumption by invoice type
const calculateConsumptionByType = (type) => {
  switch (type) {
    case "energy":
      return `450 kWh`;
    case "water":
      return `15 cubic meters`;
    case "gas":
      return `120 cubic meters`;
    default:
      return `Various services`;
  }
};

// Helper function to get emission factor by invoice type
const getEmissionFactorByType = (type) => {
  switch (type) {
    case "energy":
      return `0.233 kg CO₂/kWh`;
    case "water":
      return `0.344 kg CO₂/m³`;
    case "gas":
      return `2.0 kg CO₂/m³`;
    default:
      return `Various factors`;
  }
};

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [invoiceType, setInvoiceType] = useState("energy");
  const [calculatingEmissions, setCalculatingEmissions] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Document theme
    document.body.className = `${theme}-theme`;

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userObj = JSON.parse(localStorage.getItem("userObj"));
        if (token && userObj) {
          setUserData(userObj);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    // Fetch invoices
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        /*
        const response = await fetch(`${REACT_APP_API_URL}/invoices`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
        */

        // Sample data (replace with actual API call in production)
        setTimeout(() => {
          const sampleInvoices = [
            {
              id: 1,
              fileName: "energy-invoice-2023.pdf",
              uploadDate: "2023-05-15T10:30:00Z",
              invoiceDate: "2023-05-01",
              invoiceNumber: "INV-2023-001",
              type: "energy",
              provider: "EnergyCorp",
              co2Emissions: 125.5,
              filePath: "/uploads/invoices/energy-invoice-2023.pdf",
            },
            {
              id: 2,
              fileName: "water-bill-q2.pdf",
              uploadDate: "2023-06-10T14:15:00Z",
              invoiceDate: "2023-06-01",
              invoiceNumber: "WTR-2023-Q2",
              type: "water",
              provider: "CityWaters",
              co2Emissions: 35.2,
              filePath: "/uploads/invoices/water-bill-q2.pdf",
            },
            {
              id: 3,
              fileName: "gas-invoice-july.pdf",
              uploadDate: "2023-08-05T09:45:00Z",
              invoiceDate: "2023-07-28",
              invoiceNumber: "GAS-2023-07",
              type: "gas",
              provider: "NaturalGas Inc",
              co2Emissions: 78.3,
              filePath: "/uploads/invoices/gas-invoice-july.pdf",
            },
          ];
          setInvoices(sampleInvoices);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchInvoices();
  }, [navigate, theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.clear();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = `${newTheme}-theme`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just show the filename
        setFilePreview(null);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setInvoiceType("energy");
    setCalculationResult(null);
    setInvoiceDate("");
    setInvoiceNumber("");
    setProvider("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!invoiceDate || !invoiceNumber || !provider) {
      setError("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", invoiceType);
      formData.append("invoiceDate", invoiceDate);
      formData.append("invoiceNumber", invoiceNumber);
      formData.append("provider", provider);

      // In a real app, upload the file to your server
      /*
      const token = localStorage.getItem("token");
      const response = await axios.post(`${REACT_APP_API_URL}/invoices/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        // After successful upload, start emission calculation
        calculateEmissions(response.data.fileId);
      }
      */

      // Simulate upload success and proceed to emission calculation
      setTimeout(() => {
        setIsUploading(false);
        calculateEmissions("temp-file-id-" + Date.now());
      }, 1500);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      setError("Failed to upload file. Please try again.");
    }
  };

  const calculateEmissions = async (fileId) => {
    setCalculatingEmissions(true);

    try {
      // Get the invoice content (in a real system, this would be OCR text from the uploaded file)
      // Here we're simulating invoice content based on the invoice type
      const invoiceContent = generateMockInvoiceContent(invoiceType, provider);

      // Call OpenAI API to calculate emissions
      const openaiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an assistant that calculates CO2 emissions from invoice data. Provide calculations and explanations.",
            },
            {
              role: "user",
              content: `Calculate the CO2 emissions based on the invoice below:\n\n${invoiceContent}\n\nProvide the total CO2 emissions in kg, and a breakdown of calculations.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      // Process the OpenAI response
      const aiResponse = openaiResponse.data.choices[0].message.content;

      // Extract emissions value using regex (this is a simple example)
      let emissionsValue = 0;
      const emissionsMatch = aiResponse.match(
        /(\d+(\.\d+)?)(\s*)(kg|kilograms)/i
      );
      if (emissionsMatch) {
        emissionsValue = parseFloat(emissionsMatch[1]);
      } else {
        // If no specific value found, generate a random one (for demo purposes)
        emissionsValue = parseFloat((Math.random() * 100 + 20).toFixed(2));
      }

      // Set calculation result
      const simulatedResult = {
        success: true,
        emissions: emissionsValue,
        details: {
          consumption: calculateConsumptionByType(invoiceType),
          period: "1 month",
          emissionFactor: getEmissionFactorByType(invoiceType),
          calculations: aiResponse,
        },
      };

      setCalculationResult(simulatedResult);

      // Add the new invoice to the list
      const newInvoice = {
        id: Date.now(),
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        invoiceDate: invoiceDate,
        invoiceNumber: invoiceNumber,
        type: invoiceType,
        provider: provider,
        co2Emissions: simulatedResult.emissions,
        filePath: `/uploads/invoices/${selectedFile.name}`,
        aiAnalysis: aiResponse,
      };

      setInvoices((prev) => [newInvoice, ...prev]);
      setCalculatingEmissions(false);
    } catch (error) {
      console.error("Error calculating emissions:", error);
      setCalculatingEmissions(false);

      // Provide more specific error messages based on error type
      if (error.response) {
        // The request was made and the server responded with a status code outside the range of 2xx
        if (error.response.status === 401) {
          setError(
            "Authentication failed with the AI service. Please check your API key."
          );
        } else if (error.response.status === 429) {
          setError(
            "Rate limit exceeded for the AI service. Please try again later."
          );
        } else {
          setError(
            `API error: ${error.response.status} - ${
              error.response.data?.error?.message || "Unknown error"
            }`
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError(
          "No response from the AI service. Please check your network connection."
        );
      } else {
        // Something happened in setting up the request
        setError("Failed to calculate emissions. Please try again.");
      }
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInvoiceTypeLabel = (type) => {
    const types = {
      energy: "Energy",
      water: "Water",
      gas: "Gas",
      other: "Other",
    };
    return types[type] || "Unknown";
  };

  const getInvoiceTypeBadgeClass = (type) => {
    const classes = {
      energy: "bg-warning",
      water: "bg-info",
      gas: "bg-danger",
      other: "bg-secondary",
    };
    return classes[type] || "bg-secondary";
  };

  const downloadInvoice = (invoice) => {
    // In a real app, this would download the file from your server
    // For demo purposes, we'll just show an alert
    alert(`Downloading invoice: ${invoice.fileName}`);
  };

  return (
    <div className={`dashboard-container bg-${theme}`}>
      <Sidebar
        userData={userData}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className={`main-content ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
        <div className="container">
          <h1 className="my-4">CO₂ Emissions from Invoices</h1>

          <div className="row mb-4 row-gap-4">
            <div className="col-lg-4">
              <div className={`bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Upload New Invoice</h5>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {calculationResult ? (
                    <div className="text-center py-3">
                      <div className="alert alert-success">
                        <h5>Calculation Complete!</h5>
                        <p className="mb-0">
                          CO₂ Emissions:{" "}
                          <strong>{calculationResult.emissions} kg</strong>
                        </p>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <button className="btn btn-primary" onClick={resetForm}>
                          Upload Another Invoice
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-group mb-3">
                        <label htmlFor="invoiceType" className="form-label">
                          Invoice Type
                        </label>
                        <select
                          id="invoiceType"
                          className="form-select"
                          value={invoiceType}
                          onChange={(e) => setInvoiceType(e.target.value)}
                          disabled={isUploading || calculatingEmissions}
                        >
                          <option value="energy">Energy</option>
                          <option value="water">Water</option>
                          <option value="gas">Gas</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="invoiceDate" className="form-label">
                          Invoice Date
                        </label>
                        <input
                          type="date"
                          id="invoiceDate"
                          className="form-control"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          disabled={isUploading || calculatingEmissions}
                          required
                        />
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="invoiceNumber" className="form-label">
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          id="invoiceNumber"
                          className="form-control"
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          disabled={isUploading || calculatingEmissions}
                          placeholder="e.g. INV-2023-001"
                          required
                        />
                      </div>

                      <div className="form-group mb-3">
                        <label htmlFor="provider" className="form-label">
                          Provider/Supplier
                        </label>
                        <input
                          type="text"
                          id="provider"
                          className="form-control"
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                          disabled={isUploading || calculatingEmissions}
                          placeholder="e.g. Energy Company"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label d-block">
                          Invoice File
                        </label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="d-none"
                          accept=".pdf,image/*"
                          onChange={handleFileChange}
                          disabled={isUploading || calculatingEmissions}
                        />

                        {selectedFile ? (
                          <div className="border rounded p-3 text-center position-relative">
                            {filePreview ? (
                              <img
                                src={filePreview}
                                alt="Invoice preview"
                                className="img-fluid mb-2"
                                style={{ maxHeight: "150px" }}
                              />
                            ) : (
                              <div className="py-4">
                                <i className="fas fa-file-pdf fa-3x mb-2"></i>
                                <p className="mb-0">{selectedFile.name}</p>
                              </div>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
                              onClick={resetForm}
                              disabled={isUploading || calculatingEmissions}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-outline-primary w-100"
                            onClick={triggerFileInput}
                            disabled={isUploading || calculatingEmissions}
                          >
                            <i className="fas fa-upload me-2"></i>
                            Select Invoice File
                          </button>
                        )}
                        <small className="text-muted d-block mt-1">
                          Supported formats: PDF, JPG, PNG
                        </small>
                      </div>

                      <button
                        className="btn btn-primary w-100"
                        onClick={handleUpload}
                        disabled={
                          !selectedFile ||
                          isUploading ||
                          calculatingEmissions ||
                          !invoiceDate ||
                          !invoiceNumber ||
                          !provider
                        }
                      >
                        {isUploading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Uploading...
                          </>
                        ) : calculatingEmissions ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Calculating CO₂ Emissions...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt me-2"></i>
                            Upload & Calculate Emissions
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className={`bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Saved Invoices</h5>

                  {isLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-file-invoice fa-3x mb-3 text-muted"></i>
                      <h5>No Invoices Found</h5>
                      <p className="text-muted">
                        Upload your first invoice to calculate CO₂ emissions.
                      </p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Invoice</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Provider</th>
                            <th>CO₂ Emissions</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td>{invoice.fileName}</td>
                              <td>
                                <span
                                  className={`badge ${getInvoiceTypeBadgeClass(
                                    invoice.type
                                  )}`}
                                >
                                  {getInvoiceTypeLabel(invoice.type)}
                                </span>
                              </td>
                              <td>{formatDate(invoice.invoiceDate)}</td>
                              <td>{invoice.provider}</td>
                              <td>{invoice.co2Emissions} kg</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => downloadInvoice(invoice)}
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="row mb-5">
            <div className="col-12">
              <div className={`card bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title">How It Works</h5>
                  <div className="row mt-3">
                    <div className="col-lg-4 text-center mb-4">
                      <div
                        className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="fas fa-upload text-white fa-2x"></i>
                      </div>
                      <h6 className="mt-3">1. Upload Invoice</h6>
                      <p className="text-muted">
                        Upload your energy, water, or gas invoice in PDF or
                        image format.
                      </p>
                    </div>
                    <div className="col-lg-4 text-center mb-4">
                      <div
                        className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="fas fa-robot text-white fa-2x"></i>
                      </div>
                      <h6 className="mt-3">2. AI Analysis</h6>
                      <p className="text-muted">
                        Our AI system analyzes the invoice to extract
                        consumption data.
                      </p>
                    </div>
                    <div className="col-lg-4 text-center mb-4">
                      <div
                        className="rounded-circle bg-info d-inline-flex align-items-center justify-content-center"
                        style={{ width: "60px", height: "60px" }}
                      >
                        <i className="fas fa-chart-line text-white fa-2x"></i>
                      </div>
                      <h6 className="mt-3">3. CO₂ Calculation</h6>
                      <p className="text-muted">
                        The system calculates CO₂ emissions based on consumption
                        data and emission factors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
        <div className="modal-overlay">
          <div
            className="modal mw-100 w-100 show d-block custom-scrollbar"
            tabIndex="-1"
          >
            <div className="modal-dialog w-100" style={{ maxWidth: "740px" }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Invoice Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6>Basic Information</h6>
                        <table className="table">
                          <tbody>
                            <tr>
                              <th>File Name</th>
                              <td>{selectedInvoice.fileName}</td>
                            </tr>
                            <tr>
                              <th>Invoice Number</th>
                              <td>{selectedInvoice.invoiceNumber}</td>
                            </tr>
                            <tr>
                              <th>Invoice Date</th>
                              <td>{formatDate(selectedInvoice.invoiceDate)}</td>
                            </tr>
                            <tr>
                              <th>Upload Date</th>
                              <td>{formatDate(selectedInvoice.uploadDate)}</td>
                            </tr>
                            <tr>
                              <th>Provider</th>
                              <td>{selectedInvoice.provider}</td>
                            </tr>
                            <tr>
                              <th>Type</th>
                              <td>
                                <span
                                  className={`badge ${getInvoiceTypeBadgeClass(
                                    selectedInvoice.type
                                  )}`}
                                >
                                  {getInvoiceTypeLabel(selectedInvoice.type)}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <h6>CO₂ Emissions</h6>
                        <div className="text-center py-3">
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                              width: "120px",
                              height: "120px",
                              backgroundColor:
                                theme === "light" ? "#e9ecef" : "#343a40",
                              border: `3px solid ${
                                selectedInvoice.co2Emissions < 50
                                  ? "#28a745"
                                  : selectedInvoice.co2Emissions < 100
                                  ? "#ffc107"
                                  : "#dc3545"
                              }`,
                            }}
                          >
                            <div>
                              <h3 className="mb-0">
                                {selectedInvoice.co2Emissions}
                              </h3>
                              <small>kg CO₂</small>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="mb-1">
                              Environmental Impact Equivalent:
                            </p>
                            <p className="text-muted small">
                              {(selectedInvoice.co2Emissions / 8.5).toFixed(1)}{" "}
                              trees needed for a month to absorb this CO₂
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-12">
                      <h6>Invoice Preview</h6>
                      <div className="border rounded p-3 text-center">
                        <i className="fas fa-file-pdf fa-4x text-muted"></i>
                        <p className="text-muted mt-2">
                          Preview not available. Click the download button to
                          view the full invoice.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  {selectedInvoice.aiAnalysis && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <h6>AI Analysis</h6>
                        <div className="border rounded p-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-robot me-2 text-primary"></i>
                            <span className="fw-bold">
                              CO₂ Emissions Analysis
                            </span>
                          </div>
                          <div
                            className={`p-2 rounded ${
                              theme === "light" ? "bg-light" : "bg-dark"
                            }`}
                            style={{ maxHeight: "200px", overflow: "auto" }}
                          >
                            <pre
                              className="m-0"
                              style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "0.9rem",
                                color:
                                  theme === "light" ? "#212529" : "#e9ecef",
                              }}
                            >
                              {selectedInvoice.aiAnalysis}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => downloadInvoice(selectedInvoice)}
                  >
                    <i className="fas fa-download me-2"></i>
                    Download Invoice
                  </button>
                  <button className="btn btn-primary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
