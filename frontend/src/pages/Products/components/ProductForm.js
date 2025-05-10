import React from "react";

const ProductForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  closeModal,
  isEdit,
  categories,
  units,
  transportMethods,
  theme,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="name" className="form-label">
              Product Name*
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="size" className="form-label">
              Size/Weight*
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="unit" className="form-label">
              Unit*
            </label>
            <select
              className="form-select"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              required
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="category" className="form-label">
              Category*
            </label>
            <select
              className="form-select"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="co2Value" className="form-label">
              CO₂ Value (kg)*
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="co2Value"
              name="co2Value"
              value={formData.co2Value}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="manufacturer" className="form-label">
              Manufacturer
            </label>
            <input
              type="text"
              className="form-control"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="origin" className="form-label">
              Country of Origin
            </label>
            <input
              type="text"
              className="form-control"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="materialType" className="form-label">
              Material Type
            </label>
            <input
              type="text"
              className="form-control"
              id="materialType"
              name="materialType"
              value={formData.materialType}
              onChange={handleInputChange}
              placeholder="e.g. Plastic, Metal, Wood"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="transportMethod" className="form-label">
              Transport Method
            </label>
            <select
              className="form-select"
              id="transportMethod"
              name="transportMethod"
              value={formData.transportMethod}
              onChange={handleInputChange}
            >
              <option value="">Select Transport Method</option>
              {transportMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="productionYear" className="form-label">
              Production Year
            </label>
            <input
              type="number"
              className="form-control"
              id="productionYear"
              name="productionYear"
              value={formData.productionYear}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12 mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="col-12 mb-3">
            <label htmlFor="additionalInfo" className="form-label">
              Additional Information
            </label>
            <textarea
              className="form-control"
              id="additionalInfo"
              name="additionalInfo"
              rows="2"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              placeholder="Any additional details about the product's carbon footprint"
            ></textarea>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success" disabled={isLoading}>
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {isEdit ? "Updating..." : "Adding..."}
            </>
          ) : isEdit ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
