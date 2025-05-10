import React from "react";

const StatCard = ({
  theme,
  icon,
  title,
  count,
  label,
  buttonText,
  onButtonClick,
  buttonClassName = "btn-success",
  cardClassName = "",
  hasShadow = false,
}) => {
  return (
    <div className="col-xl-4 col-md-6">
      <div
        className={`card m-0 shadow-lg h-100 bg-${theme} text-${
          theme === "light" ? "dark" : "light"
        } rounded-3 ${cardClassName}`}
      >
        <div className="card-header d-flex align-items-center">
          <i className={`fas ${icon} fa-2x me-3`}></i>
          <h4
            className={`card-title mb-0 ${
              title === "Company Locations" ? "text-start" : ""
            }`}
          >
            {title}
          </h4>
        </div>
        <div className="card-body text-center">
          <div className="display-4 font-weight-bold mt-2">{count}</div>
          <p className="card-text mt-2">
            <span className="text-muted">{label}</span>
          </p>
        </div>
        <div className="card-footer text-center">
          <button
            className={`btn ${buttonClassName} w-100 ${
              hasShadow ? "shadow-sm" : ""
            }`}
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
