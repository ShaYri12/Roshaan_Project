const Companies = require("../models/Companies");
const Employee = require("../models/Employee"); // Adjust the path as necessary
const Transportation = require("../models/Transportation"); // Adjust the path as necessary

// Get all companies
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Companies.find()
      .populate("employees")
      .populate("cars");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get a company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Companies.findById(req.params.id).populate(
      "employees"
    );
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createCompany = async (req, res) => {
  const { name, address, employees, cars } = req.body;

  try {
    const employeeIds = employees.map((employee) => employee.value); // Assuming employee has an value field
    const carIds = cars.map((car) => car.value);

    const newCompany = new Companies({
      name,
      address,
      employees: employeeIds, // Use the provided employees directly
      cars: carIds, // Use the provided cars directly
    });

    await newCompany.save();

    // Return the newly created company
    res.status(201).json(newCompany);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new company
// exports.createCompany = async (req, res) => {
//   const { name, address, employees, cars } = req.body;

//   try {
//     // Fetch employee and car IDs if they exist, otherwise use empty arrays
//     const employeeIds = employees.length
//       ? await Employee.find({ _id: { $in: employees } }).select("_id")
//       : [];

//     const carIds = cars.length
//       ? await Transportation.find({ _id: { $in: cars } }).select("_id")
//       : [];

//     // Create and save the new company
//     const newCompany = new Companies({
//       name,
//       address,
//       employees: employeeIds,
//       cars: carIds,
//     });
//     await newCompany.save();

//     // Return the newly created company
//     res.status(201).json(newCompany);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Update a company

exports.updateCompany = async (req, res) => {
  const { name, address, employees, cars } = req.body;

  try {
    // Fetch the company by ID
    const company = await Companies.findById(req.params.id);

    // If company not found, return 404
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Validate and update employees (extract only the employee IDs and ensure valid references)
    const updatedEmployees =
      employees && Array.isArray(employees)
        ? await Employee.find({
            _id: { $in: employees.map((emp) => emp.value) },
          }).select("_id")
        : company.employees; // Use existing employees if null

    // Validate and update cars (ensure car objects are valid)
    const updatedCars =
      cars && Array.isArray(cars)
        ? await Transportation.find({
            _id: { $in: cars.map((car) => car.value || car._id) },
          }).select("_id")
        : company.cars; // Use existing cars if null

    // Update company with the new or existing data
    const updatedCompany = await Companies.findByIdAndUpdate(
      req.params.id,
      {
        name: name || company.name, // Use existing name if null
        address: address || company.address, // Use existing address if null
        employees: updatedEmployees,
        cars: updatedCars,
      },
      { new: true }
    );

    // Return the updated company
    res.json(updatedCompany);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  try {
    await Companies.findByIdAndDelete(req.params.id);
    res.json({ message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
