import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { REACT_APP_API_URL } from "../../env";
import { authenticatedFetch } from "../../utils/axiosConfig";
import Sidebar from "../../components/Sidebar";
import { FaPlusCircle } from "react-icons/fa";

// Import components
import ProgressOverview from "./components/ProgressOverview";
import TargetsList from "./components/TargetsList";

// Import modals
import {
  AddTargetModal,
  EditTargetModal,
  DeleteTargetModal,
  MilestoneModal,
  EditMilestoneModal,
} from "./components/modals";

const TargetsPage = () => {
  const [targets, setTargets] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetYear: new Date().getFullYear() + 5,
    reductionGoal: 0,
    baselineYear: new Date().getFullYear(),
    baselineEmissions: 0,
    status: "active",
    scenarioId: "",
    milestones: [],
  });

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneData, setMilestoneData] = useState({
    year: new Date().getFullYear(),
    targetReduction: 0,
    actualReduction: 0,
    status: "pending",
  });
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/auth/validate-token`,
          { method: "GET" }
        );

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("userObj");
          localStorage.removeItem("userData");
          navigate("/");
        } else {
          const userObj = JSON.parse(localStorage.getItem("userObj"));
          setUserData(userObj);
        }
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/targets`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setTargets(data);
      } catch (error) {
        console.error("Error fetching targets:", error);
        setError("Failed to load targets");
      }
    };

    fetchTargets();
  }, []);

  // Add useEffect to fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await authenticatedFetch(
          `${REACT_APP_API_URL}/scenarios`,
          { method: "GET" }
        );
        const data = await response.json();
        setScenarios(data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
        setError("Failed to load scenarios");
      }
    };

    fetchScenarios();
  }, []);

  const handleAddTarget = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/targets`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      setTargets([...targets, data]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding target:", error);
      setError("Failed to add target");
    }
  };

  const handleEditTarget = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(
        `${REACT_APP_API_URL}/targets/${selectedTarget._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      setTargets(targets.map((t) => (t._id === selectedTarget._id ? data : t)));
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Error updating target:", error);
      setError("Failed to update target");
    }
  };

  const handleDeleteTarget = async () => {
    try {
      await authenticatedFetch(
        `${REACT_APP_API_URL}/targets/${selectedTarget._id}`,
        {
          method: "DELETE",
        }
      );
      setTargets(targets.filter((t) => t._id !== selectedTarget._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting target:", error);
      setError("Failed to delete target");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      targetYear: new Date().getFullYear() + 5,
      reductionGoal: 0,
      baselineYear: new Date().getFullYear(),
      baselineEmissions: 0,
      status: "active",
      scenarioId: "",
      milestones: [],
    });
  };

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

  // Calculate progress percentage for a target
  const calculateProgress = (target) => {
    if (!target) return 0;

    // Calculate the total reduction goal
    const totalReductionGoal = target.reductionGoal;

    // If no reduction goal is set, return 0 to avoid division by zero
    if (!totalReductionGoal || totalReductionGoal <= 0) return 0;

    // Calculate current reduction based on most recent milestone if available
    let currentReduction = 0;
    if (target.milestones && target.milestones.length > 0) {
      // Sort milestones by year (descending) and get the most recent one
      const sortedMilestones = [...target.milestones].sort(
        (a, b) => b.year - a.year
      );
      const latestMilestone = sortedMilestones[0];
      currentReduction = latestMilestone.actualReduction || 0;
    }

    // Calculate progress percentage
    const progressPercentage = (currentReduction / totalReductionGoal) * 100;

    // Ensure the percentage is between 0 and 100
    return Math.min(100, Math.max(0, progressPercentage));
  };

  // Chart data for target progress
  const progressChartData = {
    labels: targets.map((t) => t.name),
    datasets: [
      {
        label: "Progress (%)",
        data: targets.map((t) => calculateProgress(t)),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...(formData.milestones || []), { ...milestoneData }],
    });
    setShowMilestoneModal(false);
    // Reset milestone form
    setMilestoneData({
      year: new Date().getFullYear(),
      targetReduction: 0,
      actualReduction: 0,
      status: "pending",
    });
  };

  const editMilestone = () => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[selectedMilestoneIndex] = { ...milestoneData };
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
    setShowEditMilestoneModal(false);
    setSelectedMilestoneIndex(null);
    // Reset milestone form
    setMilestoneData({
      year: new Date().getFullYear(),
      targetReduction: 0,
      actualReduction: 0,
      status: "pending",
    });
  };

  const removeMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
  };

  const openEditMilestoneModal = (index) => {
    setSelectedMilestoneIndex(index);
    setMilestoneData({ ...formData.milestones[index] });
    setShowEditMilestoneModal(true);
  };

  const handleEdit = (target) => {
    setSelectedTarget(target);
    setFormData({
      ...target,
      scenarioId: target.scenarioId?._id || target.scenarioId,
    });
    setShowEditModal(true);
  };

  const handleDelete = (target) => {
    setSelectedTarget(target);
    setShowDeleteModal(true);
  };

  // Add a function to handle opening the Add Modal that resets the form
  const handleOpenAddModal = () => {
    // Reset form data to default values
    resetForm();
    setShowAddModal(true);
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
        <div className="container-fluid mt-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <h1>Emission Reduction Targets</h1>
            <Button variant="outline-success" onClick={handleOpenAddModal}>
              <FaPlusCircle className="me-2" /> Add New Target
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Progress Overview Component */}
          <ProgressOverview
            theme={theme}
            progressChartData={progressChartData}
          />

          {/* Targets List Component */}
          <TargetsList
            targets={targets}
            theme={theme}
            calculateProgress={calculateProgress}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />

          {/* Modal Components */}
          <AddTargetModal
            showModal={showAddModal}
            setShowModal={setShowAddModal}
            formData={formData}
            setFormData={setFormData}
            handleAddTarget={handleAddTarget}
            setShowMilestoneModal={setShowMilestoneModal}
            scenarios={scenarios}
            openEditMilestoneModal={openEditMilestoneModal}
            removeMilestone={removeMilestone}
          />

          <EditTargetModal
            showModal={showEditModal}
            setShowModal={(show) => {
              setShowEditModal(show);
              if (!show) resetForm(); // Reset form when closing edit modal
            }}
            formData={formData}
            setFormData={setFormData}
            handleEditTarget={handleEditTarget}
            setShowMilestoneModal={setShowMilestoneModal}
            scenarios={scenarios}
            openEditMilestoneModal={openEditMilestoneModal}
            removeMilestone={removeMilestone}
          />

          <DeleteTargetModal
            showModal={showDeleteModal}
            setShowModal={setShowDeleteModal}
            selectedTarget={selectedTarget}
            handleDeleteTarget={handleDeleteTarget}
          />

          <MilestoneModal
            showModal={showMilestoneModal}
            setShowModal={setShowMilestoneModal}
            milestoneData={milestoneData}
            setMilestoneData={setMilestoneData}
            addMilestone={addMilestone}
          />

          <EditMilestoneModal
            showModal={showEditMilestoneModal}
            setShowModal={setShowEditMilestoneModal}
            milestoneData={milestoneData}
            setMilestoneData={setMilestoneData}
            editMilestone={editMilestone}
          />
        </div>
      </div>
    </div>
  );
};

export default TargetsPage;
