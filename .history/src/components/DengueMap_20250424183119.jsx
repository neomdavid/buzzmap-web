import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Polygon, Rectangle, Marker } from "@react-google-maps/api";

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

const DengueMap = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [qcPolygonPaths, setQcPolygonPaths] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch("/quezon_city_boundaries.geojson")
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => ({ lat, lng })
        );
        setQcPolygonPaths(coords);
      });

    // Default location centered on Quezon City
    const fallback = { lat: 14.676, lng: 121.0437 };
    setCurrentPosition(fallback);
  }, []);

  if (!currentPosition) return <p>Loading map...</p>;

  return (
    <div className="w-full z-[10] h-[68vh] rounded-md shadow-md relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={13}
        options={{
          gestureHandling: "none", // Disable map interaction
          draggable: false, // Disable map dragging
          scrollwheel: false, // Disable zoom with scroll
        }}
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

        <Marker position={currentPosition} />
      </GoogleMap>
    </div>
  );
};

export default DengueMap;
