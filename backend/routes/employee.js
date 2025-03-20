const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

// Get all employees
router.get("/", employeeController.getEmployees);

// Get an employee by ID
router.get("/:id", employeeController.getEmployeeById);

// Create a new employee
router.post("/", employeeController.createEmployee);

// Update an employee
router.put("/:id", employeeController.updateEmployee);

// Delete an employee
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
