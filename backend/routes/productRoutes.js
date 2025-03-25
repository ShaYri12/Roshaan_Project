const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all products - optional authentication
router.get("/", authMiddleware, productController.getProducts);

// Get a single product by ID - optional authentication
router.get("/:id", authMiddleware, productController.getProductById);

// Create a new product - optional authentication
router.post("/", authMiddleware, productController.createProduct);

// Update a product - optional authentication
router.put("/:id", authMiddleware, productController.updateProduct);

// Delete a product - optional authentication
router.delete("/:id", authMiddleware, productController.deleteProduct);

module.exports = router;
