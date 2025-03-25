const Product = require("../models/Product");

// Get all products (with optional filtering)
exports.getProducts = async (req, res) => {
  try {
    const { user, category } = req.query;

    // Build query based on parameters
    const query = {};

    // If user ID is provided, filter by user
    if (user) {
      query.user = user;
    }

    // If category is provided, filter by category
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).populate(
      "user",
      "firstName lastName email"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "firstName lastName email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Get user ID from request body, authorization, or a default value
    let userId = null;

    // 1. Try to get from request body
    if (req.body && req.body.user) {
      userId = req.body.user;
    }
    // 2. Try to get from auth user object
    else if (req.user && req.user._id) {
      userId = req.user._id;
    }

    // Validate userId
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required in request body" });
    }

    // Create and save the new product
    const newProduct = new Product({
      ...req.body,
      user: userId,
    });

    await newProduct.save();

    // Return the created product
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res
      .status(400)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};
