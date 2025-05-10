import React from "react";

const NoProductsFound = ({ theme, openAddModal }) => {
  return (
    <div className={`card bg-${theme} border-0 shadow-sm`}>
      <div className="card-body text-center py-5">
        <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
        <h5>No Products Found</h5>
        <p className="text-muted">
          Add your first product to start tracking carbon footprints.
        </p>
        <button className="btn btn-success mt-3" onClick={openAddModal}>
          <i className="fas fa-plus me-2"></i>
          Add Product
        </button>
      </div>
    </div>
  );
};

export default NoProductsFound;
