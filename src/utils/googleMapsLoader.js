// Global variables to track script loading and map instances
let googleMapsScriptLoadingPromise = null;
let activeMapInstances = new Set();
let isGoogleMapsLoaded = false;

// Function to load Google Maps script
export function loadGoogleMapsScript(apiKey) {
  // If already loaded, return resolved promise
  if (window.google?.maps?.Map && isGoogleMapsLoaded) {
    console.log("[GoogleMapsLoader] Google Maps already loaded, skipping...");
    return Promise.resolve();
  }

  // If already loading, return existing promise
  if (googleMapsScriptLoadingPromise) {
    console.log(
      "[GoogleMapsLoader] Script already loading, returning existing promise..."
    );
    return googleMapsScriptLoadingPromise;
  }

  // Check if script element already exists in DOM
  const existingScript = document.getElementById("google-maps-script");
  if (existingScript) {
    console.log(
      "[GoogleMapsLoader] Script element already exists, waiting for load..."
    );
    return new Promise((resolve, reject) => {
      const checkReady = () => {
        if (window.google?.maps?.Map && window.google?.maps?.marker) {
          console.log("[GoogleMapsLoader] Existing script loaded successfully");
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
      console.log(
        "[GoogleMapsLoader] Script element exists, waiting for load..."
      );
      const check = () => {
        if (window.google?.maps?.Map) {
          console.log("[GoogleMapsLoader] Script loaded from existing element");
          isGoogleMapsLoaded = true;
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }

    console.log("[GoogleMapsLoader] Creating new script element...");
    // Create and append script element
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("[GoogleMapsLoader] Script loaded successfully");
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
  console.log(
    "[GoogleMapsLoader] Map created and added to activeMapInstances:",
    map
  );
  console.log(
    "[GoogleMapsLoader] activeMapInstances size:",
    activeMapInstances.size
  );
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
  console.log("[GoogleMapsLoader] isValidMapInstance called with:", map);
  console.log(
    "[GoogleMapsLoader] activeMapInstances has map:",
    activeMapInstances.has(map)
  );
  console.log(
    "[GoogleMapsLoader] activeMapInstances size:",
    activeMapInstances.size
  );

  if (!map) return false;
  if (!activeMapInstances.has(map)) return false;

  // Additional checks for map validity
  try {
    // Check if map has required methods
    console.log("[GoogleMapsLoader] Checking map methods...");
    console.log("[GoogleMapsLoader] setCenter type:", typeof map.setCenter);
    console.log("[GoogleMapsLoader] setZoom type:", typeof map.setZoom);
    console.log("[GoogleMapsLoader] setMap type:", typeof map.setMap);

    if (
      typeof map.setCenter !== "function" ||
      typeof map.setZoom !== "function" ||
      typeof map.getDiv !== "function"
    ) {
      console.log("[GoogleMapsLoader] Method validation failed");
      return false;
    }

    console.log("[GoogleMapsLoader] Method validation passed");

    // Check if map is still attached to DOM
    const mapDiv = map.getDiv();
    console.log("[GoogleMapsLoader] mapDiv:", mapDiv);
    console.log(
      "[GoogleMapsLoader] document.contains(mapDiv):",
      mapDiv ? document.contains(mapDiv) : "mapDiv is null"
    );
    if (!mapDiv || !document.contains(mapDiv)) {
      console.log("[GoogleMapsLoader] DOM attachment check failed");
      return false;
    }

    console.log("[GoogleMapsLoader] Map validation passed successfully");
    return true;
  } catch (error) {
    console.warn("[GoogleMapsLoader] Map instance validation failed:", error);
    return false;
  }
}
