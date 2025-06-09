// Global variables to track script loading and map instances
let googleMapsScriptLoadingPromise = null;
let activeMapInstances = new Set();

// Function to load Google Maps script
export function loadGoogleMapsScript(apiKey) {
  // If already loaded, return resolved promise
  if (window.google?.maps?.Map) {
    return Promise.resolve();
  }

  // If already loading, return existing promise
  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }

  // Create new loading promise
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    if (document.getElementById('google-maps-script')) {
      const check = () => {
        if (window.google?.maps?.Map) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }

    // Create and append script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('[GoogleMapsLoader] Script loaded successfully');
      resolve();
    };
    
    script.onerror = (err) => {
      console.error('[GoogleMapsLoader] Error loading script:', err);
      googleMapsScriptLoadingPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptLoadingPromise;
}

// Function to create a new map instance
export function createMapInstance(element, options) {
  if (!window.google?.maps?.Map) {
    throw new Error('Google Maps not loaded');
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
    map.overlays.forEach(overlay => {
      if (overlay && typeof overlay.setMap === 'function') {
        overlay.setMap(null);
      }
    });
  }
  
  // Clear the map instance
  if (typeof map.setMap === 'function') {
    map.setMap(null);
  }
  
  // Remove from active instances
  activeMapInstances.delete(map);
}

// Function to cleanup all map instances
export function cleanupAllMapInstances() {
  activeMapInstances.forEach(map => {
    cleanupMapInstance(map);
  });
  activeMapInstances.clear();
}

// Function to check if a map instance is valid
export function isValidMapInstance(map) {
  return map && activeMapInstances.has(map);
} 