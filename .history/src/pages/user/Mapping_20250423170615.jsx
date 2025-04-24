import React, { useState, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const quezonCityCenter = {
  lat: 14.676,
  lng: 121.0437,
};

const sampleBreedingGrounds = [
  { lat: 14.6545, lng: 121.0336 },
  { lat: 14.6398, lng: 121.0504 },
  { lat: 14.676, lng: 121.0437 },
];

const MapComponent = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your actual key
  });

  const mapRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState("Dengue Risk");

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  return isLoaded ? (
    <div className="flex flex-col gap-4">
      <select
        value={selectedOption}
        onChange={handleDropdownChange}
        className="w-full max-w-xs select select-bordered"
      >
        <option value="Dengue Risk">Dengue Risk</option>
        <option value="Breeding Grounds">Breeding Grounds</option>
      </select>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={quezonCityCenter}
        zoom={13}
        onLoad={onMapLoad}
      >
        {/* Show breeding ground pins if selected */}
        {selectedOption === "Breeding Grounds" &&
          sampleBreedingGrounds.map((coords, index) => (
            <Marker
              key={index}
              position={coords}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />
          ))}

        {/* You can add dengue risk overlays or logic here */}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading Map...</div>
  );
};

export default MapComponent;
