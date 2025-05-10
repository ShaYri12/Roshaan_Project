import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Line } from "react-chartjs-2";

const ProgressOverview = ({ theme, progressChartData }) => {
  return (
    <Row className="mb-4">
      <Col>
        <Card className={`bg-${theme} m-0`}>
          <Card.Body>
            <Card.Title className="mb-4">Target Progress Overview</Card.Title>
            <div style={{ height: "400px", padding: "20px" }}>
              <Line
                data={progressChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: theme === "dark" ? "#fff" : "#666",
                        font: {
                          size: 12,
                        },
                      },
                      title: {
                        display: true,
                        text: "Progress (%)",
                        color: theme === "dark" ? "#fff" : "#666",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                    },
                    x: {
                      grid: {
                        color:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        color: theme === "dark" ? "#fff" : "#666",
                        font: {
                          size: 12,
                        },
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        padding: 20,
                        color: theme === "dark" ? "#fff" : "#666",
                        font: {
                          size: 12,
                        },
                      },
                    },
                    tooltip: {
                      backgroundColor:
                        theme === "dark"
                          ? "rgba(0, 0, 0, 0.8)"
                          : "rgba(255, 255, 255, 0.8)",
                      titleColor: theme === "dark" ? "#fff" : "#000",
                      bodyColor: theme === "dark" ? "#fff" : "#000",
                      padding: 12,
                      displayColors: true,
                    },
                  },
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ProgressOverview;
