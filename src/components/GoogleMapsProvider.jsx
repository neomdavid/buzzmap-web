import { createContext, useContext, useEffect, useState } from "react";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader";

const GoogleMapsContext = createContext(null);

// Define libraries as a static constant
const GOOGLE_MAPS_LIBRARIES = ["geometry", "marker", "places", "visualization"];

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Check if Google Maps is already loaded and fully initialized
    if (window.google?.maps?.Map && window.google?.maps?.marker) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.getElementById("google-maps-script")) {
      const waitForExistingScript = () => {
        return new Promise((resolve) => {
          const checkReady = () => {
            if (window.google?.maps?.Map && window.google?.maps?.marker) {
              resolve();
            } else {
              setTimeout(checkReady, 50);
            }
          };
          checkReady();
        });
      };

      waitForExistingScript().then(() => {
        setIsLoaded(true);
      });
      return;
    }

    const loadMaps = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error(
            "Google Maps API key is not defined. Please check your .env file."
          );
        }

        if (
          apiKey === "your_google_maps_api_key_here" ||
          apiKey.includes("your_")
        ) {
          throw new Error(
            "Google Maps API key is not properly configured. Please replace the placeholder with your actual API key."
          );
        }

        await loadGoogleMapsScript(apiKey);

        // Wait for Google Maps to be fully initialized
        const waitForGoogleMaps = () => {
          return new Promise((resolve) => {
            const checkReady = () => {
              if (window.google?.maps?.Map && window.google?.maps?.marker) {
                resolve();
              } else {
                setTimeout(checkReady, 50);
              }
            };
            checkReady();
          });
        };

        await waitForGoogleMaps();
        setIsLoaded(true);
      } catch (err) {
        setLoadError(err);
      }
    };

    loadMaps();
  }, []);

  if (loadError) {
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
