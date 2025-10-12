// Global variables to track script loading and map instances
let googleMapsScriptLoadingPromise = null;
let activeMapInstances = new Set();
let isGoogleMapsLoaded = false;

// Function to load Google Maps script
export function loadGoogleMapsScript(apiKey) {
  // If already loaded, return resolved promise
  if (window.google?.maps?.Map && isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  // If already loading, return existing promise
  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }

  // Check if script element already exists in DOM
  const existingScript = document.getElementById("google-maps-script");
  if (existingScript) {
    return new Promise((resolve, reject) => {
      const checkReady = () => {
        if (window.google?.maps?.Map && window.google?.maps?.marker) {
          isGoogleMapsLoaded = true;
          resolve();
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    });
  }

  // Create new loading promise
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    if (document.getElementById("google-maps-script")) {
      const check = () => {
        if (window.google?.maps?.Map) {
          isGoogleMapsLoaded = true;
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }

    // Create and append script element
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    script.onerror = (err) => {
      console.error("[GoogleMapsLoader] Error loading script:", err);
      console.error("[GoogleMapsLoader] This could be due to:");
      console.error("1. Invalid API key");
      console.error("2. API key restrictions (domain/IP)");
      console.error("3. Missing required APIs (Maps JavaScript API)");
      console.error("4. Network connectivity issues");
      googleMapsScriptLoadingPromise = null;
      isGoogleMapsLoaded = false;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptLoadingPromise;
}

// Function to create a new map instance
export function createMapInstance(element, options) {
  if (!window.google?.maps?.Map) {
    throw new Error("Google Maps not loaded");
  }

  if (!element) {
    throw new Error("Map container element is required");
  }

  // Check if element is attached to DOM
  if (!document.contains(element)) {
    throw new Error("Map container element must be attached to DOM");
  }

  const map = new window.google.maps.Map(element, options);
  activeMapInstances.add(map);
  return map;
}

// Function to cleanup a map instance
export function cleanupMapInstance(map) {
  if (!map) return;

  // Remove all overlays from the map
  if (map.overlays) {
    map.overlays.forEach((overlay) => {
      if (overlay && typeof overlay.setMap === "function") {
        overlay.setMap(null);
      }
    });
  }

  // Clear the map instance
  if (typeof map.setMap === "function") {
    map.setMap(null);
  }

  // Remove from active instances
  activeMapInstances.delete(map);
}

// Function to cleanup all map instances
export function cleanupAllMapInstances() {
  activeMapInstances.forEach((map) => {
    cleanupMapInstance(map);
  });
  activeMapInstances.clear();
}

// Function to check if a map instance is valid
export function isValidMapInstance(map) {
  if (!map) return false;
  if (!activeMapInstances.has(map)) return false;

  // Additional checks for map validity
  try {
    // Check if map has required methods
    if (
      typeof map.setCenter !== "function" ||
      typeof map.setZoom !== "function" ||
      typeof map.getDiv !== "function"
    ) {
      return false;
    }

    // Check if map is still attached to DOM
    const mapDiv = map.getDiv();
    if (!mapDiv || !document.contains(mapDiv)) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[GoogleMapsLoader] Map instance validation failed:", error);
    return false;
  }
}
