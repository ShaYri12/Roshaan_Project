import React, { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import "./LocationAutocomplete.css";

/**
 * A location autocomplete component that displays suggestions as you type
 * and allows selection from a dropdown of options
 */
const LocationAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search for a location",
  className = "",
  inputClassName = "",
  suggestionsClassName = "",
  required = false,
  disabled = false,
  label = null,
  errorMessage = "",
}) => {
  const [inputValue, setInputValue] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Update local state when value prop changes
  useEffect(() => {
    if (value?.address) {
      setInputValue(value.address);
    }
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search function
  const fetchSuggestions = debounce(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location suggestions");
      }

      const data = await response.json();
      setSuggestions(data);
      setError("");
    } catch (err) {
      console.error("Error fetching location suggestions:", err);
      setError("Error fetching suggestions");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Update the parent component with the input value
    if (onChange) {
      onChange(newValue);
    }

    // Fetch suggestions for the new value
    fetchSuggestions(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationData = {
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
      placeId: suggestion.place_id,
      osm_type: suggestion.osm_type,
      addressComponents: suggestion.address,
    };

    setInputValue(suggestion.display_name);
    setSuggestions([]);
    setIsFocused(false);

    // Notify parent component of selection
    if (onSelect) {
      onSelect(locationData);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (inputValue.trim()) {
      fetchSuggestions(inputValue);
    }
  };

  return (
    <div className={`location-autocomplete ${className}`}>
      {label && (
        <label htmlFor="location-input" className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="position-relative">
        <input
          ref={inputRef}
          id="location-input"
          type="text"
          className={`form-control ${inputClassName} ${
            error ? "is-invalid" : ""
          }`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
        />

        {isLoading && (
          <div
            className="spinner-border spinner-border-sm text-secondary position-absolute"
            style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        )}

        {isFocused && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className={`location-suggestions list-group mt-1 ${suggestionsClassName}`}
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="list-group-item list-group-item-action"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-main">{suggestion.display_name}</div>
                {suggestion.address && (
                  <small className="text-muted">
                    {suggestion.address.road && `${suggestion.address.road}, `}
                    {suggestion.address.city && `${suggestion.address.city}, `}
                    {suggestion.address.country && suggestion.address.country}
                  </small>
                )}
              </li>
            ))}
          </ul>
        )}

        {error && <div className="invalid-feedback">{error}</div>}
        {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
      </div>
    </div>
  );
};

LocationAutocomplete.propTypes = {
  value: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  suggestionsClassName: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  errorMessage: PropTypes.string,
};

export default LocationAutocomplete;
