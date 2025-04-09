const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/InvoiceController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply required auth middleware to all routes
// This ensures that only authenticated users can access these endpoints
router.use(authMiddleware.required);

// Upload and process invoice
router.post("/upload", invoiceController.uploadInvoice);

// Get all invoices for the authenticated user
router.get("/", invoiceController.getInvoices);

// Get a single invoice by ID
router.get("/:id", invoiceController.getInvoice);

// Download an invoice
router.get("/:id/download", invoiceController.downloadInvoice);

// Delete an invoice
router.delete("/:id", invoiceController.deleteInvoice);

module.exports = router;
