import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon issue in React with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to update the map view when location changes
const MapUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelected }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelected) {
        try {
          // Reverse geocode to get the address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch location data");
          }

          const data = await response.json();

          onLocationSelected({
            lat: lat,
            lon: lng,
            address: data.display_name,
            placeId: data.place_id,
            addressComponents: data.address,
          });
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          onLocationSelected({
            lat: lat,
            lon: lng,
            address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          });
        }
      }
    },
  });

  return null;
};

/**
 * A reusable map component with marker
 */
const MapComponent = ({
  location,
  onLocationSelected,
  height = "300px",
  width = "100%",
  defaultZoom = 13,
  showMarker = true,
  className = "",
  popupContent = null,
}) => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default to London

  useEffect(() => {
    if (location && location.lat && location.lon) {
      setPosition([location.lat, location.lon]);
    }
  }, [location]);

  return (
    <div className={className} style={{ height, width }}>
      <MapContainer
        center={position}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater center={position} />

        {showMarker && location && (
          <Marker position={position}>
            {popupContent ? (
              <Popup>{popupContent}</Popup>
            ) : location?.address ? (
              <Popup>{location.address}</Popup>
            ) : null}
          </Marker>
        )}

        {onLocationSelected && (
          <MapClickHandler onLocationSelected={onLocationSelected} />
        )}
      </MapContainer>
    </div>
  );
};

MapComponent.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
    address: PropTypes.string,
  }),
  onLocationSelected: PropTypes.func,
  height: PropTypes.string,
  width: PropTypes.string,
  defaultZoom: PropTypes.number,
  showMarker: PropTypes.bool,
  className: PropTypes.string,
  popupContent: PropTypes.node,
};

export default MapComponent;
