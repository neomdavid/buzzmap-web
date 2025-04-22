// StreetViewMap.jsx
import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef } from "react";

const StreetViewMap = ({ lat = 14.5995, lng = 120.9842 }) => {
  const containerRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_API_KEY_HERE",
  });

  useEffect(() => {
    if (isLoaded && containerRef.current) {
      const panorama = new window.google.maps.StreetViewPanorama(
        containerRef.current,
        {
          position: { lat, lng },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
        }
      );
    }
  }, [isLoaded, lat, lng]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
};

export default StreetViewMap;
