let barangaysPromise = null;

export function getBarangaysGeoJSON() {
  if (!barangaysPromise) {
    barangaysPromise = fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load barangay boundaries");
        return res.json();
      })
      .catch((err) => {
        barangaysPromise = null;
        throw err;
      });
  }
  return barangaysPromise;
}
