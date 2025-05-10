import React from "react";
import { Row, Col } from "react-bootstrap";
import TargetCard from "./TargetCard";

const TargetsList = ({
  targets,
  theme,
  calculateProgress,
  handleEdit,
  handleDelete,
}) => {
  return (
    <Row>
      {targets.map((target) => (
        <Col key={target._id} xl={4} md={6} className="mb-4">
          <TargetCard
            target={target}
            theme={theme}
            calculateProgress={calculateProgress}
            onEdit={() => handleEdit(target)}
            onDelete={() => handleDelete(target)}
          />
        </Col>
      ))}
    </Row>
  );
};

export default TargetsList;
