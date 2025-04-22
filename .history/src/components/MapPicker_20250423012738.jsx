const fetchBarangay = (coords) => {
  if (geoJsonData) {
    const point = turf.point([coords.lng, coords.lat]);

    // Loop through each barangay and check if the point is inside the boundary
    for (let feature of geoJsonData.features) {
      const geometry = feature.geometry;
      if (geometry && geometry.type === "Polygon") {
        // Ensure the polygon is closed by checking if the first and last coordinates are the same
        let coordinates = geometry.coordinates[0];
        if (
          (coordinates &&
            coordinates[0][0] !== coordinates[coordinates.length - 1][0]) ||
          coordinates[0][1] !== coordinates[coordinates.length - 1][1]
        ) {
          // Close the polygon by adding the first coordinate to the end
          coordinates.push(coordinates[0]);
        }

        // Now, check if the point is inside the polygon
        const polygon = turf.polygon([coordinates]);
        if (turf.booleanPointInPolygon(point, polygon)) {
          const barangayName = feature.properties.name; // Assuming the barangay name is stored in 'properties'
          onLocationSelect(coords, barangayName);
          console.log("Barangay selected:", barangayName);
          return;
        }
      } else if (geometry && geometry.type === "MultiPolygon") {
        // Handle MultiPolygon geometry type
        for (let coordsArray of geometry.coordinates) {
          let coordinates = coordsArray[0];
          if (
            (coordinates &&
              coordinates[0][0] !== coordinates[coordinates.length - 1][0]) ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push(coordinates[0]);
          }

          const polygon = turf.polygon([coordinates]);
          if (turf.booleanPointInPolygon(point, polygon)) {
            const barangayName = feature.properties.name;
            onLocationSelect(coords, barangayName);
            console.log("Barangay selected:", barangayName);
            return;
          }
        }
      }
    }
    alert("This location is outside Quezon City boundaries.");
  }
};
