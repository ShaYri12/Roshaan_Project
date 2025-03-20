import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JWT_ADMIN_SECRET, REACT_APP_API_URL } from "../env";
import { FaHome, FaUserPlus } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";

const EnergyEmissions = () => {
    const user = JSON.parse(localStorage.getItem("userObj"));
    const [energyRecords, setEnergyRecords] = useState([]);

    const [emissionRecord, setEmissionRecord] = useState({
        userId: `${user._id}`,
        startDate: "",
        endDate: "",
        energySources: [{ type: "", emission: "" }],
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteRecordId, setDeleteRecordId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnergyEmissions = async () => {
            try {
                const response = await fetch(`${REACT_APP_API_URL}/energy-emissions`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Ensure energySources is an array of objects, not strings
                const parsedData = data.map((record) => ({
                    ...record,
                    energySources: record.energySources.map((source) =>
                        typeof source === "string" ? JSON.parse(source) : source
                    ),
                }));

                setEnergyRecords(parsedData); // Set energy emissions in state
                console.log("Energy Emission Records:", parsedData);
            } catch (error) {
                console.error("Error fetching energy emissions:", error);
                // setError(error.message);
            }
        };

        fetchEnergyEmissions();
    }, []); // Runs only on component mount

    // Add a new energy source
    const addEnergySource = () => {
        setEmissionRecord((prev) => ({
            ...prev,
            energySources: [...prev.energySources, { type: "", emission: "" }],
        }));
    };

    // Remove an energy source
    const removeEnergySource = (index) => {
        setEmissionRecord((prev) => ({
            ...prev,
            energySources: prev.energySources.filter((_, i) => i !== index),
        }));
    };

    // Handle energy source input changes
    // const handleEnergyChange = (index, field, value) => {
    //     const updatedSources = [...energySources];
    //     updatedSources[index][field] = value;
    //     setEnergySources(updatedSources);
    // };

    //  useEffect(() => {

    //  },[energySources]);

    // Handle form submission
    // const handleSubmit = () => {
    //     const newRecord = {
    //         id: Date.now(),
    //         month: parseInt(month),
    //         year: parseInt(year),
    //         energySources: energySources.map((source) => ({
    //             type: source.type,
    //             emission: parseFloat(source.emission),
    //         })),
    //     };

    //     setEnergyRecords([...energyRecords, newRecord]); // Save data
    //     setShowForm(false); // Close form
    //     setMonth("");
    //     setYear("");
    //     setEnergySources([{ type: "", emission: "" }]); // Reset form
    // };

    const handleAdd = () => {
        setEmissionRecord({
            userId: `${user._id}`, // User ID (can be set based on auth)
            startDate: "",
            endDate: "",
            energySources: [{ type: "", emission: "" }],
        });
        setShowAddModal(true);
    };

    const closeAddModal = () => setShowAddModal(false);
    const closeEditModal = () => setShowEditModal(false);

    // Edit modal handler
    const handleEdit = (record) => {
        console.log("Editing record:", record);

        setEmissionRecord({
            userId: `${user._id}`,
            startDate: record.startDate,
            endDate: record.endDate,
            month: record.month,
            year: record.year,
            energySources: record.energySources.map((source) => ({
                type: source.type,
                emission: source.emission,
            })),
            _id: record._id,
        });

        setShowEditModal(true);
    };

    // Submit new or updated record
    const handleSubmit = async (e, isUpdate = false) => {
        e.preventDefault();
        console.log(isUpdate ? "Updating record..." : "Adding new record...", emissionRecord);

        try {
            const formattedEmissionRecord = {
                ...emissionRecord,
                energySources: emissionRecord.energySources.map(
                    (source) => JSON.stringify(source)
                ), // Convert each object to a string
            };

            const url = isUpdate
                ? `${REACT_APP_API_URL}/energy-emissions/${emissionRecord._id}`
                : `${REACT_APP_API_URL}/energy-emissions`;

            const method = isUpdate ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
                },
                body: JSON.stringify(formattedEmissionRecord),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            console.log(
                `Energy Emission record ${isUpdate ? "updated" : "added"} successfully!`,
                await response.json()
            );
            window.location.reload();
        } catch (error) {
            console.error(`Error ${isUpdate ? "updating" : "adding"} record:`, error);
        }
    };

    // Confirm delete
    const confirmDelete = (data) => {
        setDeleteRecordId(data._id);
        setShowDeleteConfirm(true);
    };

    // Delete the emission record
    const handleDelete = async () => {
        try {
            console.log("Deleting record ID:", deleteRecordId);
            const response = await fetch(`${REACT_APP_API_URL}/energy-emissions/${deleteRecordId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${JWT_ADMIN_SECRET}`,
                },
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            console.log("Energy Emission record deleted successfully!");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting record:", error);
        }
    };


    // Handle energy source input changes
    const handleEnergySourceChange = (e, index, field) => {
        setEmissionRecord((prev) => {
            const updatedSources = [...prev.energySources];
            updatedSources[index][field] = e.target.value;
            return { ...prev, energySources: updatedSources };
        });
    };

    // Handle general input changes
    const handleInputChange = (e, field) => {
        setEmissionRecord((prev) => ({
            ...prev,
            [field]: e.target.value,
            userId: `${user._id}`,
        }));
    };

    const formatDate = (isoString) => {
        if (!isoString) return ""; // Handle empty or undefined values
        return new Date(isoString).toISOString().split("T")[0];
    };
    
    const formatDateForListing = (isoString) => {
        if (!isoString) return ""; // Handle empty or undefined values
    
        const date = new Date(isoString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <div className="card-header d-flex align-items-center">
                        <i className="fas fa-chart-line fa-2x me-3"></i>
                        <h4 className="card-title mb-0">Energy Emission Records</h4>
                    </div>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        <FaHome className="me-2" /> Home
                    </button>
                </div>
            </nav>
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <p>Total Records: {energyRecords.length}</p>
                    <button className="btn btn-success" onClick={handleAdd}>
                        <FaUserPlus className="me-2" /> Add New Record
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                {/* <th>User ID</th> */}
                                {/* <th>Month</th> */}
                                {/* <th>Year</th> */}
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Energy Sources</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {energyRecords.length > 0 ? (
                                energyRecords.map((record, index) => (
                                    <tr key={record._id}>
                                        <td>{index + 1}</td>
                                        {/* <td>{record.userId}</td> */}
                                        {/* <td>{[
                                            "January", "February", "March", "April", "May", "June",
                                            "July", "August", "September", "October", "November", "December"
                                        ].filter((month, index) => index + 1 == record.month)}</td>
                                        <td>{record.year}</td> */}
                                        <td>{formatDateForListing(record.startDate)}</td>
                                        <td>{formatDateForListing(record.endDate)}</td>
                                        <td>
                                            {record.energySources.map((source, i) => (
                                                <div key={i} data-id={typeof source}>
                                                    <strong>{source.type}:</strong> {source.emission} kg CO₂
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            <div className="d-flex">
                                                <button
                                                    className="btn btn-info btn-sm me-2"
                                                    onClick={() => handleEdit(record)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => confirmDelete(record)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>


                {/* Modal Form */}
                <Modal show={showAddModal} onHide={closeAddModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Energy Emission Record</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            {/* Month Selection */}
                            {/* <Form.Group className="mb-3">
                                <Form.Label>Month</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={emissionRecord.month}
                                    onChange={(e) => handleInputChange(e, "month")}
                                >
                                    <option value="">Select Month</option>
                                    {[...Array(12).keys()].map((m) => (
                                        <option key={m + 1} value={m + 1}>
                                            {new Date(0, m).toLocaleString("default", { month: "long" })}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group> */}

                            {/* Year Selection */}
                            {/* <Form.Group className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter Year (e.g., 2024)"
                                    value={emissionRecord.year}
                                    onChange={(e) => handleInputChange(e, "year")}
                                />
                            </Form.Group> */}
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type="date" value={emissionRecord.startDate} onChange={(e) => handleInputChange(e, "startDate")} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>End Date</Form.Label>
                                <Form.Control type="date" value={emissionRecord.endDate} onChange={(e) => handleInputChange(e, "endDate")} />
                            </Form.Group>

                            {/* Energy Sources Section */}
                            <Form.Group>
                                <Form.Label>Energy Sources</Form.Label>
                                {emissionRecord.energySources.map((source, index) => (
                                    <div key={index} className="d-flex mb-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Energy Type (e.g., Electricity, Gas)"
                                            value={source.type}
                                            onChange={(e) => handleEnergySourceChange(e, index, "type")}
                                            className="me-2"
                                        />
                                        <Form.Control
                                            type="number"
                                            placeholder="CO₂ Emission (kg)"
                                            value={source.emission}
                                            onChange={(e) => handleEnergySourceChange(e, index, "emission")}
                                            className="me-2"
                                        />
                                        {index > 0 && (
                                            <Button variant="danger" onClick={() => removeEnergySource(index)}>
                                                X
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </Form.Group>

                            {/* Add More Energy Sources */}
                            <Button variant="primary" className="mt-2" onClick={addEnergySource}>
                                + Add Another Energy Source
                            </Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeAddModal}>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={handleSubmit}>
                            Save Record
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Edit form */}
                <Modal show={showEditModal} onHide={closeEditModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Energy Emission Record</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={(e) => handleSubmit(e, true)}>
                        <Modal.Body>

                            {/* Month */}
                            {/* <Form.Group controlId="month" className="mb-3">
                                <Form.Label>Month</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={emissionRecord.month}
                                    onChange={(e) => handleInputChange(e, "month")}
                                >
                                    {[
                                        "January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"
                                    ].map((month, index) => (
                                        <option key={index} value={index + 1}>
                                            {month}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group> */}

                            {/* Year */}
                            {/* <Form.Group controlId="year" className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={emissionRecord.year}
                                    onChange={(e) => handleInputChange(e, "year")}
                                    placeholder="Enter year"
                                />
                            </Form.Group> */}

                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control type="date" value={formatDate(emissionRecord.startDate)} onChange={(e) => handleInputChange(e, "startDate")} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control type="date" value={formatDate(emissionRecord.endDate)} onChange={(e) => handleInputChange(e, "endDate")} />
                                </Form.Group>
                            {/* Energy Sources (Dynamic) */}
                            <Form.Group controlId="energySources" className="mb-3">
                                <Form.Label>Energy Sources</Form.Label>
                                {emissionRecord.energySources.map((source, index) => (
                                    <div key={index} className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            type="text"
                                            className="me-2"
                                            value={source.type}
                                            onChange={(e) => handleEnergySourceChange(e, index, "type")}
                                            placeholder="Energy Type (e.g., Electricity, Gas)"
                                        />
                                        <Form.Control
                                            type="number"
                                            value={source.emission}
                                            onChange={(e) => handleEnergySourceChange(e, index, "emission")}
                                            placeholder="Emission (kg CO2)"
                                        />
                                        <Button variant="danger" className="ms-2" onClick={() => removeEnergySource(index)}>✖</Button>
                                    </div>
                                ))}
                                {/* Add More Energy Sources */}
                                <Button variant="primary" className="mt-2" onClick={addEnergySource}>
                                    + Add Another Energy Source
                                </Button>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" className="mt-3" onClick={closeEditModal}>
                                Cancel
                            </Button>
                            <Button variant="success" type="submit" className="mt-3">
                                Update
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this energy emission record?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        </div>
    );
};

export default EnergyEmissions;
