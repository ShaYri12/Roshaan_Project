import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LocationAutocomplete from "./LocationAutocomplete";
import MapComponent from "./MapComponent";

const LocationPicker = ({
  value,
  onChange,
  label,
  required = false,
  placeholder = "Search for a location",
  mapHeight = "250px",
  className = "",
  error = "",
  disabled = false,
}) => {
  const [location, setLocation] = useState(value || null);

  // Update local state when prop changes
  useEffect(() => {
    if (value) {
      setLocation(value);
    }
  }, [value]);

  const handleLocationSelect = (newLocation) => {
    setLocation(newLocation);
    if (onChange) {
      onChange(newLocation);
    }
  };

  const handleMapLocationSelect = (mapLocation) => {
    setLocation(mapLocation);
    if (onChange) {
      onChange(mapLocation);
    }
  };

  return (
    <div className={`location-picker ${className}`}>
      <LocationAutocomplete
        value={location}
        onSelect={handleLocationSelect}
        placeholder={placeholder}
        label={label}
        required={required}
        disabled={disabled}
        errorMessage={error}
      />

      <div className="mt-2">
        <MapComponent
          location={location}
          onLocationSelected={handleMapLocationSelect}
          height={mapHeight}
          className="rounded border"
        />
        {location && (
          <small className="form-text text-muted mt-1">
            Click anywhere on the map to change the location
          </small>
        )}
      </div>
    </div>
  );
};

LocationPicker.propTypes = {
  value: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  onChange: PropTypes.func,
  label: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  mapHeight: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default LocationPicker;
