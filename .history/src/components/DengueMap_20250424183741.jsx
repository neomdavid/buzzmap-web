// MapComponent.js
import React from "react";
import { GoogleMap, Polygon, Marker, Rectangle } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const QC_BOUNDS = {
  north: 14.7406,
  south: 14.4795,
  east: 121.1535,
  west: 121.022,
};

const DengueMap = ({
  isLoaded,
  currentPosition,
  qcPolygonPaths,
  barangayData,
  markerPosition,
  handleMapClick,
  mapRef,
}) => {
  if (!isLoaded || !currentPosition) return <p>Loading map...</p>;

  return (
    <div className="map-container" style={{ height: "100vh" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        <Polygon
          paths={qcPolygonPaths}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.05,
          }}
        />
        <Rectangle
          bounds={QC_BOUNDS}
          options={{
            fillOpacity: 0,
            strokeWeight: 0,
            clickable: false,
            zIndex: 2,
          }}
        />
        {barangayData?.features.map((feature, index) => {
          const geometry = feature.geometry;
          const coordsArray =
            geometry.type === "Polygon"
              ? [geometry.coordinates]
              : geometry.type === "MultiPolygon"
              ? geometry.coordinates
              : [];

          return coordsArray.map((polygonCoords, i) => {
            const path = polygonCoords[0].map(([lng, lat]) => ({
              lat,
              lng,
            }));
            return (
              <Polygon
                key={`${index}-${i}`}
                paths={path}
                options={{
                  strokeColor: "#333",
                  strokeOpacity: 0.6,
                  strokeWeight: 1,
                  fillOpacity: 0.5,
                  fillColor: feature.properties.color,
                }}
              />
            );
          });
        })}
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  );
};

export default DengueMap;
