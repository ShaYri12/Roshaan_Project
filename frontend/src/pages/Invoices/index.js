import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { REACT_APP_API_URL } from "../../env";
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
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [error, setError] = useState(null);
  const [processingStage, setProcessingStage] = useState("");

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
        const response = await fetch(`${REACT_APP_API_URL}/invoices`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setInvoices(data.data || []);
        } else {
          console.error("Failed to fetch invoices");
          setInvoices([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setIsLoading(false);
        setInvoices([]);
      }
    };

    fetchUserData();
    fetchInvoices();
  }, [navigate, theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userObj");
    localStorage.removeItem("userData");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setProcessingStage("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", invoiceType);

      const token = localStorage.getItem("token");

      setProcessingStage("extracting");

      const response = await axios.post(
        `${REACT_APP_API_URL}/invoices/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setIsUploading(false);

      if (response.status === 201) {
        // Processing was successful, show results
        setProcessingStage("analyzing");
        setCalculatingEmissions(true);

        // The API already calculated the emissions, so we can just display the result
        const result = {
          success: true,
          emissions: response.data.invoice.co2Emissions,
          details: {
            consumption:
              response.data.invoice.consumption +
              " " +
              response.data.invoice.consumptionUnit,
            period: "Based on invoice",
            emissionFactor: response.data.invoice.emissionFactor,
            calculations: response.data.analysis,
          },
        };

        setCalculationResult(result);

        // Add the new invoice to the list if it's not already there
        setInvoices((prev) => {
          const newInvoice = {
            id: response.data.invoice.id,
            fileName: response.data.invoice.fileName,
            originalName: response.data.invoice.originalName,
            uploadDate: response.data.invoice.createdAt,
            invoiceDate: response.data.invoice.invoiceDate,
            invoiceNumber: response.data.invoice.invoiceNumber,
            type: response.data.invoice.type,
            provider: response.data.invoice.provider,
            co2Emissions: response.data.invoice.co2Emissions,
            aiAnalysis: response.data.analysis,
          };

          // Check if we already have this invoice (by ID)
          const exists = prev.some((inv) => inv.id === newInvoice.id);

          if (exists) {
            return prev;
          } else {
            return [newInvoice, ...prev];
          }
        });

        setCalculatingEmissions(false);
        setProcessingStage("");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      setCalculatingEmissions(false);
      setProcessingStage("");

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code outside 2xx range
        if (error.response.status === 401) {
          setError("Authentication error. Please log in again.");
        } else if (error.response.status === 413) {
          setError("File too large. Maximum size is 10MB.");
        } else if (error.response.status === 415) {
          setError(
            "Unsupported file format. Please upload PDF or image files only."
          );
        } else {
          const errorMsg =
            error.response.data?.message || "Server error. Please try again.";

          // Special handling for OCR and PDF extraction errors
          if (
            errorMsg.includes("OCR processing failed") ||
            errorMsg.includes("Failed to extract text from PDF")
          ) {
            setError(
              <div>
                <strong>Text extraction error:</strong>
                <p>{errorMsg}</p>
                <ul className="mt-2 small">
                  <li>Make sure your document is not password protected</li>
                  <li>
                    Try converting image-based PDFs to text-based PDFs first
                  </li>
                  <li>
                    For better results, choose "scan to text" (OCR) when
                    scanning documents
                  </li>
                </ul>
              </div>
            );
          } else {
            setError(errorMsg);
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request
        setError("Failed to upload file. Please try again later.");
      }
    }
  };

  const handleViewInvoice = async (invoice) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${REACT_APP_API_URL}/invoices/${invoice.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedInvoice({
          ...invoice,
          aiAnalysis: data.data.aiAnalysis,
          consumption: data.data.consumption,
          consumptionUnit: data.data.consumptionUnit,
          emissionFactor: data.data.emissionFactor,
        });
        setShowModal(true);
      } else {
        setError("Failed to fetch invoice details");
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      setError("Failed to fetch invoice details");
    }
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

  const downloadInvoice = async (invoice) => {
    try {
      const token = localStorage.getItem("token");

      // Create a download link
      const response = await fetch(
        `${REACT_APP_API_URL}/invoices/${invoice.id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element and trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = invoice.originalName || invoice.fileName;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("Failed to download invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      setError("Failed to download invoice");
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${REACT_APP_API_URL}/invoices/${invoice.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          // Remove the deleted invoice from the state
          setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to delete invoice");
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        setError("Network error while deleting invoice");
      } finally {
        setIsLoading(false);
      }
    }
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
              <div className={`card p-0 m-0 bg-${theme} border-0 shadow-sm`}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Upload New Invoice</h5>

                  <div className="mb-3">
                    <button
                      className="btn btn-link p-0 text-decoration-none text-muted"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#helpCollapse"
                      aria-expanded="false"
                      aria-controls="helpCollapse"
                      onClick={(e) => {
                        e.preventDefault();
                        const helpElement =
                          document.getElementById("helpCollapse");
                        if (helpElement) {
                          helpElement.classList.toggle("show");
                        }
                      }}
                    >
                      <i className="fas fa-question-circle me-1"></i> Need help
                      with uploading?
                    </button>
                    <div className="collapse" id="helpCollapse">
                      <div className="card card-body mt-2 bg-light">
                        <h6>Supported File Types:</h6>
                        <ul className="small mb-2">
                          <li>PDF documents (preferred)</li>
                          <li>Images (JPG, PNG)</li>
                        </ul>
                        <h6>Best Practices:</h6>
                        <ul className="small mb-0">
                          <li>
                            Ensure the invoice is clearly visible and not blurry
                          </li>
                          <li>Make sure consumption data is visible</li>
                          <li>
                            Invoice should include provider details and dates
                          </li>
                          <li>
                            For energy invoices, kWh usage should be clearly
                            visible
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

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
                          !selectedFile || isUploading || calculatingEmissions
                        }
                      >
                        {isUploading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            {processingStage === "uploading"
                              ? "Uploading..."
                              : "Processing..."}
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
                            <i className="fas fa-magic me-2"></i>
                            Scan Invoice & Calculate Emissions
                          </>
                        )}
                      </button>

                      {isUploading && (
                        <div className="mt-3 text-center">
                          <div className="alert alert-info">
                            <small>
                              {processingStage === "uploading" && (
                                <>
                                  <i className="fas fa-file-upload me-2"></i>
                                  Uploading your invoice...
                                </>
                              )}
                              {processingStage === "extracting" && (
                                <>
                                  <i className="fas fa-file-alt me-2"></i>
                                  Extracting invoice data using OCR...
                                </>
                              )}
                            </small>
                          </div>
                        </div>
                      )}

                      {calculatingEmissions && (
                        <div className="mt-3 text-center">
                          <div className="alert alert-info">
                            <small>
                              <i className="fas fa-robot me-2"></i>
                              AI is analyzing your invoice and calculating
                              emissions. This may take a moment...
                            </small>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className={`card p-0 m-0 bg-${theme} border-0 shadow-sm`}>
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
                              <td>
                                {invoice.originalName || invoice.fileName}
                              </td>
                              <td>
                                {invoice.emissionTypes ? (
                                  invoice.emissionTypes.map((type, index) => (
                                    <span
                                      key={index}
                                      className={`badge ${getInvoiceTypeBadgeClass(
                                        type
                                      )} me-1`}
                                    >
                                      {getInvoiceTypeLabel(type)}
                                    </span>
                                  ))
                                ) : (
                                  <span
                                    className={`badge ${getInvoiceTypeBadgeClass(
                                      invoice.type
                                    )}`}
                                  >
                                    {getInvoiceTypeLabel(invoice.type)}
                                  </span>
                                )}
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
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteInvoice(invoice)}
                                >
                                  <i className="fas fa-trash"></i>
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
              <div className={`card p-0 m-0 bg-${theme} border-0 shadow-sm`}>
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
                              <td>
                                {selectedInvoice.originalName ||
                                  selectedInvoice.fileName}
                              </td>
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
                                {selectedInvoice.emissionTypes ? (
                                  selectedInvoice.emissionTypes.map(
                                    (type, index) => (
                                      <span
                                        key={index}
                                        className={`badge ${getInvoiceTypeBadgeClass(
                                          type
                                        )} me-1`}
                                      >
                                        {getInvoiceTypeLabel(type)}
                                      </span>
                                    )
                                  )
                                ) : (
                                  <span
                                    className={`badge ${getInvoiceTypeBadgeClass(
                                      selectedInvoice.type
                                    )}`}
                                  >
                                    {getInvoiceTypeLabel(selectedInvoice.type)}
                                  </span>
                                )}
                              </td>
                            </tr>
                            {selectedInvoice.consumption && (
                              <tr>
                                <th>Consumption</th>
                                <td>
                                  {selectedInvoice.consumption}{" "}
                                  {selectedInvoice.consumptionUnit}
                                </td>
                              </tr>
                            )}
                            {selectedInvoice.emissionFactor && (
                              <tr>
                                <th>Emission Factor</th>
                                <td>{selectedInvoice.emissionFactor}</td>
                              </tr>
                            )}
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

                          {/* Display per-type emissions if available */}
                          {selectedInvoice.emissionBreakdown && (
                            <div className="mt-4">
                              <h6>Emissions Breakdown</h6>
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Type</th>
                                    <th>Emissions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(
                                    selectedInvoice.emissionBreakdown
                                  ).map(([type, value], index) => (
                                    <tr key={index}>
                                      <td>
                                        <span
                                          className={`badge ${getInvoiceTypeBadgeClass(
                                            type
                                          )}`}
                                        >
                                          {getInvoiceTypeLabel(type)}
                                        </span>
                                      </td>
                                      <td>{value} kg CO₂</td>
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
                  <button
                    className="btn btn-outline-danger me-auto"
                    onClick={() => {
                      closeModal();
                      handleDeleteInvoice(selectedInvoice);
                    }}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Delete Invoice
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
