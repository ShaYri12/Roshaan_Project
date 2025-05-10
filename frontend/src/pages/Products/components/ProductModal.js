import React from "react";
import ProductForm from "./ProductForm";

const ProductModal = ({
  showModal,
  modalTitle,
  theme,
  closeModal,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  isEdit,
  categories,
  units,
  transportMethods,
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal mw-100 w-100 show d-block custom-scrollbar"
        tabIndex="-1"
      >
        <div className="modal-dialog w-100" style={{ maxWidth: "740px" }}>
          <div className={`modal-content custom-scrollbar bg-${theme}`}>
            <div className="modal-header">
              <h5 className="modal-title">{modalTitle}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              ></button>
            </div>
            <ProductForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              closeModal={closeModal}
              isEdit={isEdit}
              categories={categories}
              units={units}
              transportMethods={transportMethods}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
