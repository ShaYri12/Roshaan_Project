import React from "react";
import Select from "react-select";

const CarsSelect = ({ modalData, carsState, handleCarChange }) => {
  const formatCarData = (car) => ({
    value: car._id ? car._id : car.value,
    label: `${car.name}`,
    key: car._id ? car._id : car.value,
  });

  const selectedCars = modalData?.cars?.map(formatCarData);
  const carOptions = carsState.map(formatCarData);

  return (
    <div className="mb-3">
      <label htmlFor="cars" className="form-label">
        Transportation's
      </label>
      <Select
        id="cars"
        isMulti
        value={selectedCars}
        onChange={handleCarChange}
        options={carOptions}
      />
    </div>
  );
};

export default CarsSelect;
