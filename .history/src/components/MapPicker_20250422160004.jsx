import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = ({ onLocationSelect }) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [barangayPolygons, setBarangayPolygons] = useState([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(coords);
        setMarkerPosition(coords);
        fetchBarangay(coords);
      },
      () => alert("Failed to get current position")
    );

    fetch("../geojson/quezon-barangays.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const polygons = geojson.features.map((feature) => {
          const coordinates = feature.geometry.coordinates[0].map((point) => ({
            lat: point[1],
            lng: point[0],
          }));
          return {
            name: feature.properties.name,
            path: coordinates,
          };
        });
        setBarangayPolygons(polygons);
      });
  }, []);

  const handleMapClick = (e) => {
    const coords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkerPosition(coords);
    fetchBarangay(coords);
  };

  const fetchBarangay = async (coords) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${
        coords.lng
      }&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    const barangayComponent = data.results[0]?.address_components.find(
      (comp) =>
        comp.types.includes("sublocality") || comp.types.includes("political")
    );
    if (barangayComponent) {
      onLocationSelect(coords, barangayComponent.long_name);
    }
  };

  return isLoaded && currentPosition ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={14}
      onClick={handleMapClick}
    >
      {markerPosition && <Marker position={markerPosition} />}
      {barangayPolygons.map((poly, i) => (
        <Polygon
          key={i}
          paths={poly.path}
          options={{
            strokeColor: "#4285F4",
            strokeOpacity: 0.6,
            strokeWeight: 1.5,
            fillColor: "#4285F4",
            fillOpacity: 0.1,
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default MapPicker;
