const Employee = require("../models/Employee");
const Transportation = require("../models/Transportation");

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("car");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get an employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new employee

exports.createEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    homeAddress,
    companyAddress,
    car,
  } = req.body;

  try {
    // First, save the car details to the Transportation model
    const newCar = new Transportation({
      name: car.name,
      type: car.type,
      licensePlate: car.licensePlate,
      companyCar: car.companyCar,
    });

    // Save the car and wait for it to be saved before proceeding
    const savedCar = await newCar.save();

    // Now, create the employee and link the car by its ObjectId
    const newEmployee = new Employee({
      firstName,
      lastName,
      email,
      password,
      homeAddress,
      companyAddress,
      car: savedCar._id, // Save the car's ID in the employee
    });

    // Save the employee
    await newEmployee.save();

    // Now, update the saved car with the employee ID
    savedCar.employeeId = newEmployee._id;
    console.log((savedCar.employeeId = newEmployee._id));
    await savedCar.save();

    // Return the newly created employee along with the car info
    res.status(201).json({
      employee: newEmployee,
      car: savedCar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    homeAddress,
    companyAddress,
    car,
  } = req.body;

  try {
    // Check if the employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // If car details need to be updated, update the car model first
    if (car) {
      // Check if there's a car associated with the employee
      const existingCar = await Transportation.findById(employee.car);

      // If the car exists, update it; otherwise, create a new car
      if (existingCar) {
        existingCar.name = car.name || existingCar.name;
        existingCar.type = car.type || existingCar.type;
        existingCar.licensePlate = car.licensePlate || existingCar.licensePlate;
        existingCar.companyCar = car.companyCar || existingCar.companyCar;
        await existingCar.save();
      } else {
        // If no car exists, create a new car
        const newCar = new Transportation({
          name: car.name,
          type: car.type,
          licensePlate: car.licensePlate,
          companyCar: car.companyCar,
        });
        const savedCar = await newCar.save();
        employee.car = savedCar._id; // Assign the new car to the employee
      }
    }

    // Update the employee details
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;
    employee.password = password || employee.password;
    employee.homeAddress = homeAddress || employee.homeAddress;
    employee.companyAddress = companyAddress || employee.companyAddress;

    // Save the updated employee details
    const updatedEmployee = await employee.save();

    // Return the updated employee and car details
    const updatedCar = await Transportation.findById(updatedEmployee.car);

    await updatedEmployee.populate("car");

    await updatedCar.populate("employeeId");

    res.json({
      employee: updatedEmployee,
      car: updatedCar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
