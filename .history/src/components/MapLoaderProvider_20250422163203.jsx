import React from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["geometry", "places", "maps"]; // Add all libraries you'll need

export const MapLoaderProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) return <p>Error loading maps</p>;
  if (!isLoaded) return <p>Loading maps...</p>;

  return children;
};
