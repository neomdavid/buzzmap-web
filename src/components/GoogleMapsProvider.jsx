import { createContext, useContext, useEffect, useState } from "react";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader";

const GoogleMapsContext = createContext(null);

// Define libraries as a static constant
const GOOGLE_MAPS_LIBRARIES = ["geometry", "marker", "places", "visualization"];

export const GoogleMapsProvider = ({ children }) => {
  console.log("[DEBUG] GoogleMapsProvider: Initializing...");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  useEffect(() => {
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      .then(() => {
        console.log("[DEBUG] GoogleMapsProvider: Script loaded successfully");
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("[DEBUG] GoogleMapsProvider: Error loading script", err);
        setLoadError(err);
      });
  }, []);

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