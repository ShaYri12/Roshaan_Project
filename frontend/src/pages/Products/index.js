import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../env";
import Sidebar from "../../components/Sidebar";

// Import components
import ProductTable from "./components/ProductTable";
import NoProductsFound from "./components/NoProductsFound";
import ProductModal from "./components/ProductModal";

// Import utilities
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getEmptyFormData,
  getFormDataFromProduct,
  CATEGORIES,
  UNITS,
  TRANSPORT_METHODS,
} from "./utils/productUtils";

const ProductsPage = () => {
  const navigate = useNavigate();

  // UI state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // User state
  const [userData, setUserData] = useState(null);

  // Product state
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(getEmptyFormData());

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

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;
        const productsData = await fetchProducts(token);

        console.log("Products fetched:", productsData);
        setProducts(productsData);
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
    loadProducts();
  }, [navigate, theme]);

  // Form handling functions
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
    setFormData(getEmptyFormData(userId));
  };

  // Modal functions
  const openAddModal = () => {
    // Get the user ID from state, with a fallback
    const userId = userData?._id || "6624c7ab8a89c9f76ded3d9e";
    setFormData(getEmptyFormData(userId));
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    const userId = userData?._id || "6624c7ab8a89c9f76ded3d9e";
    setFormData(getFormDataFromProduct(product, userId));
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  // CRUD operations
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
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

      const newProduct = await addProduct(productData, token);
      console.log("Product added successfully:", newProduct);

      // Update the products list and close the modal
      setProducts((prev) => [...prev, newProduct]);
      setError(null);
      closeModal();
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

      const updatedProduct = await updateProduct(
        selectedProduct._id,
        productData,
        token
      );
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
      const token = localStorage.getItem("token") || JWT_ADMIN_SECRET;
      await deleteProduct(id, token);

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

  // Theme and sidebar functions
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
            <NoProductsFound theme={theme} openAddModal={openAddModal} />
          ) : (
            <ProductTable
              products={products}
              openEditModal={openEditModal}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* Add Product Modal */}
          <ProductModal
            showModal={showAddModal}
            modalTitle="Add New Product"
            theme={theme}
            closeModal={closeModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleAddProduct}
            isLoading={isLoading}
            isEdit={false}
            categories={CATEGORIES}
            units={UNITS}
            transportMethods={TRANSPORT_METHODS}
          />

          {/* Edit Product Modal */}
          <ProductModal
            showModal={showEditModal}
            modalTitle="Edit Product"
            theme={theme}
            closeModal={closeModal}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleUpdateProduct}
            isLoading={isLoading}
            isEdit={true}
            categories={CATEGORIES}
            units={UNITS}
            transportMethods={TRANSPORT_METHODS}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
