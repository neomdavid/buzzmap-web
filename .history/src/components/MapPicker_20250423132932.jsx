// components/MapPicker.jsx
import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Marker, Rectangle } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";
import * as turf from "@turf/turf";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

export default function MapPicker({ onLocationSelect }) {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const [barangayData, setBarangayData] = useState(null);

  const mapRef = useRef(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    // QC boundary
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      })
      .catch(console.error);

    // Barangay boundaries
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then(setBarangayData)
      .catch(console.error);

    // Get user position
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const p = { lat: coords.latitude, lng: coords.longitude };
        setCurrentPosition(p);
        setMarkerPosition(p);
        handleSelection(p);
      },
      () => {
        // fallback to QC center
        const p = { lat: 14.676, lng: 121.0437 };
        setCurrentPosition(p);
        setMarkerPosition(p);
      }
    );
  }, []);

  const handleSelection = (coords) => {
    if (
      coords.lat < QC_BOUNDS.south ||
      coords.lat > QC_BOUNDS.north ||
      coords.lng < QC_BOUNDS.west ||
      coords.lng > QC_BOUNDS.east
    ) {
      alert("Please select a location within Quezon City");
      return false;
    }

    if (barangayData) {
      const pt = turf.point([coords.lng, coords.lat]);
      for (let f of barangayData.features) {
        let polys = [];
        if (f.geometry.type === "Polygon") {
          polys = [f.geometry.coordinates];
        } else if (f.geometry.type === "MultiPolygon") {
          polys = f.geometry.coordinates;
        }

        for (let polyCoords of polys) {
          let ring = [...polyCoords[0]];
          const [x0, y0] = ring[0];
          const [xn, yn] = ring[ring.length - 1];
          if (x0 !== xn || y0 !== yn) ring.push(ring[0]);

          const poly = turf.polygon([ring]);
          if (turf.booleanPointInPolygon(pt, poly)) {
            onLocationSelect(coords, f.properties.name);
            return true;
          }
        }
      }

      alert("This location is inside QC but outside any barangay polygon.");
      return true;
    }

    return true;
  };

  const handleMapClick = (e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    console.log("Clicked:", coords);
    if (handleSelection(coords)) {
      setMarkerPosition(coords);
    }
  };

  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={13}
      onClick={handleMapClick}
      onLoad={(map) => (mapRef.current = map)}
    >
      {/* QC boundary */}
      <Polygon
        paths={qcPolygonPaths}
        options={{
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.1,
          zIndex: 1,
        }}
      />

      {/* Barangay boundaries */}
      {barangayData?.features.map((feature, index) => {
        const geometry = feature.geometry;
        const coordsArray =
          geometry.type === "Polygon"
            ? [geometry.coordinates]
            : geometry.coordinates;

        return coordsArray.map((polygonCoords, i) => {
          const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
          return (
            <Polygon
              key={`${index}-${i}`}
              paths={path}
              options={{
                strokeColor: "#0000FF",
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillOpacity: 0.05,
                fillColor: "#0000FF",
                zIndex: 0,
              }}
            />
          );
        });
      })}

      {/* Transparent QC overlay to allow clicks */}
      <Rectangle
        bounds={QC_BOUNDS}
        options={{
          fillOpacity: 0,
          strokeWeight: 0,
          clickable: true,
          zIndex: 2,
        }}
        onClick={handleMapClick}
      />

      {/* Marker */}
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
}
