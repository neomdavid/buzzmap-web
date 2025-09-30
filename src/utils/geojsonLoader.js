let barangaysPromise = null;
let barangaysCache = null;

export function getBarangaysGeoJSON() {
  // Return cached data if available
  if (barangaysCache) {
    return Promise.resolve(barangaysCache);
  }

  if (!barangaysPromise) {
    barangaysPromise = fetch("/quezon_barangays_boundaries.geojson", {
      // Add cache control headers
      headers: {
        "Cache-Control": "public, max-age=86400", // 24 hours
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load barangay boundaries");
        return res.json();
      })
      .then((data) => {
        // Cache the data in memory
        barangaysCache = data;
        return data;
      })
      .catch((err) => {
        barangaysPromise = null;
        throw err;
      });
  }
  return barangaysPromise;
}

// Clear cache function for development/debugging
export function clearBarangaysCache() {
  barangaysCache = null;
  barangaysPromise = null;
}
