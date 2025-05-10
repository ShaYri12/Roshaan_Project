import React from "react";
import { Card, Button, ProgressBar } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const TargetCard = ({ target, theme, calculateProgress, onEdit, onDelete }) => {
  return (
    <Card className={`bg-${theme} m-0 h-100`}>
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center">
          {target.name}
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={onEdit}
            >
              <FaEdit />
            </Button>
            <Button variant="outline-danger" size="sm" onClick={onDelete}>
              <FaTrash />
            </Button>
          </div>
        </Card.Title>
        <Card.Text>{target.description}</Card.Text>
        <div className="mb-2">
          <strong>Status:</strong>{" "}
          <span
            className={`badge bg-${
              target.status === "active"
                ? "primary"
                : target.status === "achieved"
                ? "success"
                : target.status === "missed"
                ? "danger"
                : "secondary"
            }`}
          >
            {target.status.charAt(0).toUpperCase() + target.status.slice(1)}
          </span>
        </div>
        <div className="mb-2">
          <strong>Scenario:</strong>{" "}
          {target.scenarioId?.name || "No scenario linked"}
        </div>
        <div className="mb-2">
          <strong>Timeline:</strong> {target.baselineYear} - {target.targetYear}
        </div>
        <div className="mb-2">
          <strong>Baseline Emissions:</strong> {target.baselineEmissions} tCO₂e
        </div>
        <div className="mb-2">
          <strong>Reduction Goal:</strong> {target.reductionGoal} tCO₂e (
          {((target.reductionGoal / target.baselineEmissions) * 100).toFixed(1)}
          %)
        </div>
        <div className="mt-3">
          <strong>Progress:</strong>
          <ProgressBar
            now={calculateProgress(target)}
            label={`${calculateProgress(target).toFixed(1)}%`}
            variant={
              calculateProgress(target) >= 100
                ? "success"
                : calculateProgress(target) >= 50
                ? "info"
                : "warning"
            }
            className="mt-2"
          />
        </div>
        {target.milestones && target.milestones.length > 0 && (
          <div className="mt-3">
            <strong>Latest Milestone:</strong>{" "}
            {target.milestones.sort((a, b) => b.year - a.year)[0].year} -
            {target.milestones.sort((a, b) => b.year - a.year)[0].status}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TargetCard;
