import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { getGeocode, getLatLng } from "react-google-maps/api";

const MapComponent = ({ setCoordinates, setBarangay }) => {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);

  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your Google Maps API key
    libraries: ["places"],
  });

  useEffect(() => {
    if (markerPosition) {
      reverseGeocode(markerPosition);
    }
  }, [markerPosition]);

  const reverseGeocode = async (position) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await geocoder.geocode({ location: position });
      const address = results[0].address_components;
      const barangay = address.find((comp) =>
        comp.types.includes("administrative_area_level_2")
      )?.long_name;
      setBarangay(barangay || "Unknown");
      setCoordinates(`${position.lat()}, ${position.lng()}`);
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  };

  const handleMapClick = (event) => {
    const position = event.latLng;
    setMarkerPosition(position);
  };

  const handleMarkerDragEnd = (event) => {
    const position = event.latLng;
    setMarkerPosition(position);
  };

  return (
    <div className="map-container">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={markerPosition || { lat: 14.5995, lng: 120.9842 }} // Default to a center position
          zoom={12}
          onClick={handleMapClick}
          onLoad={(mapInstance) => setMap(mapInstance)}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default MapComponent;
