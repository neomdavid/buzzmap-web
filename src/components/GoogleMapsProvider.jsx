import { useJsApiLoader } from "@react-google-maps/api";
import { createContext, useContext } from "react";

const GoogleMapsContext = createContext(null);

// Define libraries as a static constant
const GOOGLE_MAPS_LIBRARIES = ["geometry", "marker", "places", "visualization"];

export const GoogleMapsProvider = ({ children }) => {
  console.log("[DEBUG] GoogleMapsProvider: Initializing...");
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  console.log("[DEBUG] GoogleMapsProvider: isLoaded =", isLoaded);
  console.log("[DEBUG] GoogleMapsProvider: loadError =", loadError);

  if (loadError) {
    console.error("[DEBUG] GoogleMapsProvider: Error loading Google Maps API", loadError);
    return <div>Error loading Google Maps API</div>;
  }

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
}; 