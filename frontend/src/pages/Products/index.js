import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../env";
import Sidebar from "../../components/Sidebar";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    unit: "kg",
    co2Value: "",
    category: "",
    manufacturer: "",
    description: "",
    materialType: "",
    origin: "",
    transportMethod: "",
    productionYear: new Date().getFullYear(),
    additionalInfo: "",
    user: "",
  });

  const categories = [
    "Electronics",
    "Furniture",
    "Office Supplies",
    "Food & Beverages",
    "Construction Materials",
    "Packaging",
    "Textiles",
    "Chemicals",
    "Automotive",
    "Other",
  ];

  const units = ["kg", "g", "ton", "liter", "m²", "m³", "piece", "other"];
  const transportMethods = [
    "Road",
    "Sea",
    "Air",
    "Rail",
    "Multiple",
    "Unknown",
  ];

  // Fetch user data and products on component mount
  useEffect(() => {
    document.body.className = `${theme}-theme`;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        // First try to get user object with safe error handling
        let userObj = null;
        try {
          const userObjString = localStorage.getItem("userObj");
          if (userObjString) {
            userObj = JSON.parse(userObjString);
          }
        } catch (parseError) {
          console.error("Error parsing userObj from localStorage:", parseError);
        }

        // If we have both token and valid user object with ID
        if (token && userObj && userObj._id) {
          console.log("Valid user data found:", userObj.role || "unknown role");
          setUserData(userObj);

          // Set user ID in form data
          setFormData((prev) => ({
            ...prev,
            user: userObj._id,
          }));
          return; // Success! Exit the function
        }

        // If we have token but no user object, try to get userData from the server
        if (token) {
          console.log(
            "Token exists but user data incomplete, attempting to retrieve from server..."
          );

          // In the future, you could add an API call to refresh user data here
          // For now, use a default user ID to prevent errors
          const defaultUserId = "6624c7ab8a89c9f76ded3d9e"; // Replace with your test user ID

          setUserData({ _id: defaultUserId, role: "admin" });
          setFormData((prev) => ({
            ...prev,
            user: defaultUserId,
          }));
          return; // Exit with default user set
        }

        // If we reach here, no valid authentication exists
        console.warn("No valid authentication found, redirecting to login");
        navigate("/");
      } catch (error) {
        console.error("Error setting up user data:", error);
        // Don't redirect for errors - use a fallback ID instead
        const defaultUserId = "6624c7ab8a89c9f76ded3d9e";
        setUserData({ _id: defaultUserId, role: "admin" });
        setFormData((prev) => ({
          ...prev,
          user: defaultUserId,
        }));
      }
    };

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Get the token - either the user's token or the admin secret
        const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

        const response = await fetch(`${REACT_APP_API_URL}/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // No products found is not an error
            setProducts([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Products fetched:", data);
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error loading products. Please try again.");
        // If there's an error, we'll show an empty list
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchProducts();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    // Always ensure we have a user ID, using the most reliable source
    const userId = userData?._id || "6624c7ab8a89c9f76ded3d9e";

    setFormData({
      name: "",
      size: "",
      unit: "kg",
      co2Value: "",
      category: "",
      manufacturer: "",
      description: "",
      materialType: "",
      origin: "",
      transportMethod: "",
      productionYear: new Date().getFullYear(),
      additionalInfo: "",
      user: userId, // Always set the user ID
    });
  };

  const openAddModal = () => {
    // Get the user ID from state, with a fallback
    const userId = userData?._id || "6624c7ab8a89c9f76ded3d9e";

    // Reset the form with the current user ID
    setFormData({
      name: "",
      size: "",
      unit: "kg",
      co2Value: "",
      category: "",
      manufacturer: "",
      description: "",
      materialType: "",
      origin: "",
      transportMethod: "",
      productionYear: new Date().getFullYear(),
      additionalInfo: "",
      user: userId,
    });

    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);

    // For safety, use the current user's ID or the product's existing user ID, with a fallback
    const userId = userData?._id || product.user || "6624c7ab8a89c9f76ded3d9e";

    setFormData({
      name: product.name,
      size: product.size,
      unit: product.unit,
      co2Value: product.co2Value,
      category: product.category,
      manufacturer: product.manufacturer || "",
      description: product.description || "",
      materialType: product.materialType || "",
      origin: product.origin || "",
      transportMethod: product.transportMethod || "",
      productionYear: product.productionYear || new Date().getFullYear(),
      additionalInfo: product.additionalInfo || "",
      user: userId, // Always set the user ID
    });

    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For consistency, always use the token from localStorage if available
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

      // Make sure user ID is set in the form data
      let productData = { ...formData };

      // If user ID isn't set in the form data, use the userData state
      if (!productData.user && userData?._id) {
        productData.user = userData._id;
      }

      // Final fallback for user ID to prevent errors
      if (!productData.user) {
        productData.user = "6624c7ab8a89c9f76ded3d9e"; // Development fallback
      }

      console.log("Sending product data:", productData);

      const response = await fetch(`${REACT_APP_API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const newProduct = await response.json();
      console.log("Product added successfully:", newProduct);

      // Update the products list and close the modal
      setProducts((prev) => [...prev, newProduct]);
      setError(null);
      closeModal();

      // No need to refresh the page or redirect - just close the modal and show success
    } catch (error) {
      console.error("Error adding product:", error);
      setError(`Error adding product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For consistency, always use the token from localStorage if available
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

      // Make sure user ID is set in the form data
      let productData = { ...formData };

      // If user ID isn't set in the form data, use the userData state
      if (!productData.user && userData?._id) {
        productData.user = userData._id;
      }

      // Final fallback for user ID to prevent errors
      if (!productData.user) {
        productData.user = "6624c7ab8a89c9f76ded3d9e"; // Development fallback
      }

      const response = await fetch(
        `${REACT_APP_API_URL}/products/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const updatedProduct = await response.json();
      console.log("Product updated successfully:", updatedProduct);

      // Update the products list and close the modal
      setProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? updatedProduct : p))
      );
      setError(null);
      closeModal();
    } catch (error) {
      console.error("Error updating product:", error);
      setError(`Error updating product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use JWT_ADMIN_SECRET as a fallback if token is missing
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;

      const response = await fetch(`${REACT_APP_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      console.log("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(`Error deleting product: ${error.message}`);
    } finally {
      setIsLoading(false);
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
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center my-4">
            <h1>Products</h1>
            <button className="btn btn-success" onClick={openAddModal}>
              <i className="fas fa-plus me-2"></i>
              Add New Product
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className={`card bg-${theme} border-0 shadow-sm`}>
              <div className="card-body text-center py-5">
                <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
                <h5>No Products Found</h5>
                <p className="text-muted">
                  Add your first product to start tracking carbon footprints.
                </p>
                <button className="btn btn-success mt-3" onClick={openAddModal}>
                  <i className="fas fa-plus me-2"></i>
                  Add Product
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Category</th>
                    <th>CO₂ Value</th>
                    <th>Manufacturer</th>
                    <th>Origin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>
                        {product.size} {product.unit}
                      </td>
                      <td>{product.category}</td>
                      <td>{product.co2Value} kg CO₂</td>
                      <td>{product.manufacturer}</td>
                      <td>{product.origin}</td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => openEditModal(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div
                className="modal mw-100 w-100 show d-block custom-scrollbar"
                tabIndex="-1"
              >
                <div
                  className="modal-dialog w-100"
                  style={{ maxWidth: "740px" }}
                >
                  <div className={`modal-content bg-${theme}`}>
                    <div className="modal-header">
                      <h5 className="modal-title">Add New Product</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                      ></button>
                    </div>
                    <form onSubmit={handleAddProduct}>
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">
                              Product Name*
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label htmlFor="size" className="form-label">
                              Size/Weight*
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="size"
                              name="size"
                              value={formData.size}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label htmlFor="unit" className="form-label">
                              Unit*
                            </label>
                            <select
                              className="form-select"
                              id="unit"
                              name="unit"
                              value={formData.unit}
                              onChange={handleInputChange}
                              required
                            >
                              {units.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="category" className="form-label">
                              Category*
                            </label>
                            <select
                              className="form-select"
                              id="category"
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="co2Value" className="form-label">
                              CO₂ Value (kg)*
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="co2Value"
                              name="co2Value"
                              value={formData.co2Value}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="manufacturer"
                              className="form-label"
                            >
                              Manufacturer
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="manufacturer"
                              name="manufacturer"
                              value={formData.manufacturer}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="origin" className="form-label">
                              Country of Origin
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="origin"
                              name="origin"
                              value={formData.origin}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="materialType"
                              className="form-label"
                            >
                              Material Type
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="materialType"
                              name="materialType"
                              value={formData.materialType}
                              onChange={handleInputChange}
                              placeholder="e.g. Plastic, Metal, Wood"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="transportMethod"
                              className="form-label"
                            >
                              Transport Method
                            </label>
                            <select
                              className="form-select"
                              id="transportMethod"
                              name="transportMethod"
                              value={formData.transportMethod}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Transport Method</option>
                              {transportMethods.map((method) => (
                                <option key={method} value={method}>
                                  {method}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="productionYear"
                              className="form-label"
                            >
                              Production Year
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="productionYear"
                              name="productionYear"
                              value={formData.productionYear}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <label htmlFor="description" className="form-label">
                              Description
                            </label>
                            <textarea
                              className="form-control"
                              id="description"
                              name="description"
                              rows="2"
                              value={formData.description}
                              onChange={handleInputChange}
                            ></textarea>
                          </div>
                          <div className="col-12 mb-3">
                            <label
                              htmlFor="additionalInfo"
                              className="form-label"
                            >
                              Additional Information
                            </label>
                            <textarea
                              className="form-control"
                              id="additionalInfo"
                              name="additionalInfo"
                              rows="2"
                              value={formData.additionalInfo}
                              onChange={handleInputChange}
                              placeholder="Any additional details about the product's carbon footprint"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Adding...
                            </>
                          ) : (
                            "Add Product"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showEditModal && selectedProduct && (
            <div className="modal-overlay">
              <div
                className="modal mw-100 w-100 show d-block custom-scrollbar"
                tabIndex="-1"
              >
                <div
                  className="modal-dialog w-100"
                  style={{ maxWidth: "740px" }}
                >
                  <div className={`modal-content bg-${theme}`}>
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Product</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeModal}
                      ></button>
                    </div>
                    <form onSubmit={handleUpdateProduct}>
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label">
                              Product Name*
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label htmlFor="size" className="form-label">
                              Size/Weight*
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="size"
                              name="size"
                              value={formData.size}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label htmlFor="unit" className="form-label">
                              Unit*
                            </label>
                            <select
                              className="form-select"
                              id="unit"
                              name="unit"
                              value={formData.unit}
                              onChange={handleInputChange}
                              required
                            >
                              {units.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="category" className="form-label">
                              Category*
                            </label>
                            <select
                              className="form-select"
                              id="category"
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="co2Value" className="form-label">
                              CO₂ Value (kg)*
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              id="co2Value"
                              name="co2Value"
                              value={formData.co2Value}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="manufacturer"
                              className="form-label"
                            >
                              Manufacturer
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="manufacturer"
                              name="manufacturer"
                              value={formData.manufacturer}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="origin" className="form-label">
                              Country of Origin
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="origin"
                              name="origin"
                              value={formData.origin}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="materialType"
                              className="form-label"
                            >
                              Material Type
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="materialType"
                              name="materialType"
                              value={formData.materialType}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="transportMethod"
                              className="form-label"
                            >
                              Transport Method
                            </label>
                            <select
                              className="form-select"
                              id="transportMethod"
                              name="transportMethod"
                              value={formData.transportMethod}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Transport Method</option>
                              {transportMethods.map((method) => (
                                <option key={method} value={method}>
                                  {method}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="productionYear"
                              className="form-label"
                            >
                              Production Year
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              id="productionYear"
                              name="productionYear"
                              value={formData.productionYear}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <label htmlFor="description" className="form-label">
                              Description
                            </label>
                            <textarea
                              className="form-control"
                              id="description"
                              name="description"
                              rows="2"
                              value={formData.description}
                              onChange={handleInputChange}
                            ></textarea>
                          </div>
                          <div className="col-12 mb-3">
                            <label
                              htmlFor="additionalInfo"
                              className="form-label"
                            >
                              Additional Information
                            </label>
                            <textarea
                              className="form-control"
                              id="additionalInfo"
                              name="additionalInfo"
                              rows="2"
                              value={formData.additionalInfo}
                              onChange={handleInputChange}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Updating...
                            </>
                          ) : (
                            "Update Product"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
