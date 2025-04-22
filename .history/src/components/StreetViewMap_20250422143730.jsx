// StreetViewMap.jsx
import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef } from "react";

const StreetViewMap = ({ lat = 14.5995, lng = 120.9842 }) => {
  const containerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // ✅ correct usage
  });

  useEffect(() => {
    if (isLoaded && containerRef.current) {
      new window.google.maps.StreetViewPanorama(containerRef.current, {
        position: { lat, lng },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  }, [isLoaded, lat, lng]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
};

export default StreetViewMap;
