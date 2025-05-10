import { REACT_APP_API_URL, JWT_ADMIN_SECRET } from "../../../env";

// Fetch all products
export const fetchProducts = async (token) => {
  const authToken = token || JWT_ADMIN_SECRET;

  const response = await fetch(`${REACT_APP_API_URL}/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // No products found is not an error
      return [];
    }
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
};

// Add a new product
export const addProduct = async (productData, token) => {
  const authToken = token || JWT_ADMIN_SECRET;

  const response = await fetch(`${REACT_APP_API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }

  return await response.json();
};

// Update an existing product
export const updateProduct = async (productId, productData, token) => {
  const authToken = token || JWT_ADMIN_SECRET;

  const response = await fetch(`${REACT_APP_API_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }

  return await response.json();
};

// Delete a product
export const deleteProduct = async (productId, token) => {
  const authToken = token || JWT_ADMIN_SECRET;

  const response = await fetch(`${REACT_APP_API_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }

  return true;
};

// Initialize empty form data
export const getEmptyFormData = (userId) => {
  return {
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
    user: userId || "",
  };
};

// Get form data populated from product
export const getFormDataFromProduct = (product, userId) => {
  return {
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
    user: userId || product.user || "",
  };
};

// Product constants
export const CATEGORIES = [
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

export const UNITS = ["kg", "g", "ton", "liter", "m²", "m³", "piece", "other"];

export const TRANSPORT_METHODS = [
  "Road",
  "Sea",
  "Air",
  "Rail",
  "Multiple",
  "Unknown",
];
