import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  point,
  bbox,
  polygon,
  booleanPointInPolygon,
  union as turfUnion,
} from "@turf/turf";
import { useGoogleMaps as useGoogleMapsContext } from "./GoogleMapsProvider";

const QC_CENTER = { lat: 14.676, lng: 121.0437 };
const QC_BOUNDS = {
  north: 14.7406,
  south: 14.3795,
  east: 121.1535,
  west: 120.822,
};

const HIGHLIGHT_COLOR = "#2563eb"; // blue for highlight
const HIGHLIGHT_STROKE = "#111827"; // dark for border

// Utility to load Google Maps JS API ONCE
let googleMapsScriptLoadingPromise = null;
function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve();
  }
  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return googleMapsScriptLoadingPromise;
}

const MapPicker = forwardRef(
  (
    {
      onLocationSelect,
      defaultCoordinates,
      selectedBarangay,
      showOutsideQcOverlay = false,
      showBarangayLabels = false,
    },
    ref
  ) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const markerPositionRef = useRef(null);
    const overlaysRef = useRef([]);
    const highlightedBarangayRef = useRef(null);
    const [barangayData, setBarangayData] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // Use Google Maps context to ensure proper loading
    const { isLoaded: isGoogleMapsLoaded } = useGoogleMapsContext();
    const [highlightedBarangay, setHighlightedBarangay] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [toast, setToast] = useState(null);
    const [apiKey, setApiKey] = useState(
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    );
    const [qcUnionHoles, setQcUnionHoles] = useState([]);

    useEffect(() => {
      // Load barangay geojson (public/)
      fetch("/quezon_barangays_boundaries.geojson")
        .then((r) => r.json())
        .then((gj) => {
          setBarangayData(gj);
          setIsDataLoaded(true);
        });
    }, []);

    // Compute a single union polygon for QC to use as a hole for the outside overlay
    useEffect(() => {
      if (!barangayData || barangayData.features.length < 2) {
        console.log("Not enough features for union operation, skipping...");
        setQcUnionHoles([]);
        return;
      }
      try {
        let merged = null;
        for (const f of barangayData.features) {
          const feat = {
            type: "Feature",
            properties: {},
            geometry: f.geometry,
          };
          merged = merged ? turfUnion(merged, feat) : feat;
        }
        const holes = [];
        if (merged && merged.geometry) {
          if (merged.geometry.type === "Polygon") {
            const outer = merged.geometry.coordinates[0];
            const path = outer.map(([lng, lat]) => ({ lat, lng }));
            holes.push([...path].reverse());
          } else if (merged.geometry.type === "MultiPolygon") {
            for (const poly of merged.geometry.coordinates) {
              const outer = poly[0];
              const path = outer.map(([lng, lat]) => ({ lat, lng }));
              holes.push([...path].reverse());
            }
          }
        }
        setQcUnionHoles(holes);
      } catch (e) {
        console.warn("QC union failed; will fall back to per-feature holes", e);
        setQcUnionHoles([]);
      }
    }, [barangayData]);

    // Helper: find barangay by point
    function findBarangay(coords, geojson) {
      console.log("[MapPicker DEBUG] findBarangay called with:", {
        coords,
        geojson: !!geojson,
      });
      if (!geojson) {
        console.log("[MapPicker DEBUG] No geojson data");
        return null;
      }
      const pt = point([coords.lng, coords.lat]);
      console.log("[MapPicker DEBUG] Created point:", pt);
      let firstFeature = geojson.features[0];
      if (firstFeature) {
        let featureBbox = bbox(firstFeature);
        console.log(
          "[MapPicker DEBUG] First polygon bbox:",
          featureBbox,
          "Click:",
          [coords.lng, coords.lat]
        );
      }
      console.log(
        "[MapPicker DEBUG] Checking",
        geojson.features.length,
        "features"
      );
      for (let i = 0; i < geojson.features.length; i++) {
        let feature = geojson.features[i];
        let polys = [];
        if (feature.geometry.type === "Polygon") {
          polys = [feature.geometry.coordinates];
        } else if (feature.geometry.type === "MultiPolygon") {
          polys = feature.geometry.coordinates;
        }
        console.log(
          "[MapPicker DEBUG] Feature",
          i,
          "has",
          polys.length,
          "polygons"
        );
        for (let polyCoords of polys) {
          let ring = [...polyCoords[0]];
          if (
            ring[0][0] !== ring[ring.length - 1][0] ||
            ring[0][1] !== ring[ring.length - 1][1]
          ) {
            ring.push(ring[0]);
          }
          const poly = polygon([ring]);
          const isInside = booleanPointInPolygon(pt, poly);
          console.log(
            "[MapPicker DEBUG] Feature",
            i,
            "polygon check:",
            isInside
          );
          if (isInside) {
            console.log(
              "[MapPicker DEBUG] Found matching barangay:",
              feature.properties.name
            );
            return feature.properties.name;
          }
        }
      }
      console.log("[MapPicker DEBUG] No matching barangay found");
      return null;
    }

    // Draw polygons, labels and marker
    function drawMapFeatures(
      map,
      barangayData,
      highlightedBarangayName,
      markerPos
    ) {
      console.log("[MapPicker DEBUG] Drawing map features:", {
        highlightedBarangayName,
        markerPos,
      });
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      // Outside-of-QC mask using fixed outer rectangle with holes per barangay (Flutter approach)
      if (showOutsideQcOverlay) {
        const holes = [];
        if (barangayData && barangayData.features) {
          barangayData.features.forEach((feature) => {
            const geometry = feature.geometry;
            if (geometry.type === "Polygon") {
              const outer = geometry.coordinates[0];
              const path = outer.map(([lng, lat]) => ({ lat, lng }));
              holes.push(path);
            } else if (geometry.type === "MultiPolygon") {
              geometry.coordinates.forEach((poly) => {
                const outer = poly[0];
                const path = outer.map(([lng, lat]) => ({ lat, lng }));
                holes.push(path);
              });
            }
          });
        }

        // Outer rectangle (expanded bounds around QC)
        const outerBounds = [
          { lat: 16.0, lng: 119.0 }, // top-left
          { lat: 16.0, lng: 122.5 }, // top-right
          { lat: 13.5, lng: 122.5 }, // bottom-right
          { lat: 13.5, lng: 119.0 }, // bottom-left
        ];

        const outsideOverlay = new window.google.maps.Polygon({
          paths: [outerBounds, ...holes],
          strokeOpacity: 0,
          fillColor: "#ef4444",
          fillOpacity: 0.2,
          map,
          zIndex: 0,
          clickable: false,
        });
        overlaysRef.current.push(outsideOverlay);
      }

      // Polygons
      barangayData.features.forEach((feature) => {
        const geometry = feature.geometry;
        const coordsArray =
          geometry.type === "Polygon"
            ? [geometry.coordinates]
            : geometry.type === "MultiPolygon"
            ? geometry.coordinates
            : [];
        coordsArray.forEach((polygonCoords) => {
          const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
          // Only highlight if highlightedBarangayName matches
          const isHighlighted =
            highlightedBarangayName &&
            feature.properties.name === highlightedBarangayName;
          const polygonOverlay = new window.google.maps.Polygon({
            paths: path,
            strokeColor: isHighlighted ? HIGHLIGHT_STROKE : "#333",
            strokeOpacity: isHighlighted ? 1 : 0,
            strokeWeight: isHighlighted ? 3 : 0,
            // Keep QC clear unless highlighted
            fillOpacity: isHighlighted ? 0.1 : 0,
            fillColor: isHighlighted ? HIGHLIGHT_COLOR : "#3182ce",
            map,
            zIndex: isHighlighted ? 10 : 1,
            clickable: false,
          });
          overlaysRef.current.push(polygonOverlay);
        });
      });

      // Labels (centroid markers) at higher zoom levels
      if (showBarangayLabels && map.getZoom() >= 14) {
        barangayData.features.forEach((feature) => {
          // Compute centroid from outer ring of first polygon
          let outer = null;
          if (feature.geometry.type === "Polygon") {
            outer = feature.geometry.coordinates[0];
          } else if (feature.geometry.type === "MultiPolygon") {
            outer = feature.geometry.coordinates[0][0];
          }
          if (!outer) return;
          const centroid = outer.reduce(
            (acc, [lng, lat], idx, arr) => {
              // simple average centroid (sufficient for small polygons)
              return {
                lat: acc.lat + lat / arr.length,
                lng: acc.lng + lng / arr.length,
              };
            },
            { lat: 0, lng: 0 }
          );
          const labelMarker = new window.google.maps.Marker({
            position: centroid,
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 0,
            },
            label: {
              text: feature.properties.name || "",
              color: "#111827",
              fontSize: "12px",
              fontWeight: "600",
            },
            zIndex: 20,
          });
          overlaysRef.current.push(labelMarker);
        });
      }

      // Marker
      if (markerPos) {
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.google.maps.Marker({
          position: markerPos,
          map,
          title: "Selected Location",
        });
        // Keep marker independent of overlays so redraws (zoom/pan) don't clear it
      } else {
        if (markerRef.current) markerRef.current.setMap(null);
      }
    }

    // Expose panToBarangay method to parent
    useImperativeHandle(ref, () => ({
      panToBarangay: (barangayName) => {
        if (!barangayData || !mapInstance.current) return;
        const feature = barangayData.features.find(
          (f) => f.properties.name === barangayName
        );
        if (!feature) return;
        // Get all coordinates for the polygon/multipolygon
        let coords = [];
        if (feature.geometry.type === "Polygon") {
          coords = feature.geometry.coordinates[0];
        } else if (feature.geometry.type === "MultiPolygon") {
          coords = feature.geometry.coordinates[0][0];
        }
        // Compute bounds
        const bounds = new window.google.maps.LatLngBounds();
        coords.forEach(([lng, lat]) => bounds.extend({ lat, lng }));
        mapInstance.current.fitBounds(bounds);
        mapInstance.current.setZoom(16);
        setHighlightedBarangay(barangayName);
        highlightedBarangayRef.current = barangayName;
      },
    }));

    // Load Google Maps and initialize
    useEffect(() => {
      if (!isDataLoaded || !isGoogleMapsLoaded) return;
      if (!mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: QC_CENTER,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        setMapReady(true);

        // Redraw labels on zoom changes
        mapInstance.current.addListener("zoom_changed", () => {
          if (barangayData) {
            drawMapFeatures(
              mapInstance.current,
              barangayData,
              highlightedBarangayRef.current,
              markerPositionRef.current
            );
          }
        });
      }
      const map = mapInstance.current;
      drawMapFeatures(map, barangayData, highlightedBarangay, markerPosition);
    }, [isDataLoaded, isGoogleMapsLoaded, apiKey, barangayData]);

    // Setup click handler separately
    useEffect(() => {
      if (!mapReady || !mapInstance.current || !barangayData) return;

      const map = mapInstance.current;

      // Remove existing click listener if any
      if (map.clickListener) {
        window.google.maps.event.removeListener(map.clickListener);
      }

      // Add click handler
      map.clickListener = map.addListener("click", (e) => {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        console.log("[MapPicker DEBUG] Map clicked at:", coords);
        // Check if point is within QC bounds
        const isInQC =
          coords.lat >= QC_BOUNDS.south &&
          coords.lat <= QC_BOUNDS.north &&
          coords.lng >= QC_BOUNDS.west &&
          coords.lng <= QC_BOUNDS.east;
        console.log("[MapPicker DEBUG] QC bounds check:", {
          coords,
          bounds: QC_BOUNDS,
          isInQC,
        });
        if (!isInQC) {
          setToast({
            type: "error",
            message: "Please click a location within Quezon City",
          });
          console.log("[MapPicker DEBUG] Click outside QC bounds");
          return;
        }
        // Find which barangay contains this point
        const barangayName = findBarangay(coords, barangayData);
        console.log("[MapPicker DEBUG] Found barangay:", barangayName);
        if (!barangayName) {
          setToast({
            type: "error",
            message: "Selected location is not within any barangay boundary",
          });
          console.log("[MapPicker DEBUG] No barangay found for click");
          return;
        }

        console.log("[MapPicker DEBUG] Setting marker position to:", coords);
        setMarkerPosition(coords);
        markerPositionRef.current = coords;
        setHighlightedBarangay(null);
        if (onLocationSelect) {
          console.log(
            "[MapPicker DEBUG] Calling onLocationSelect:",
            coords,
            barangayName
          );
          onLocationSelect(
            `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
            barangayName
          );
        }
        setToast({
          type: "success",
          message: `Location set in ${barangayName}`,
        });
        console.log(
          "[MapPicker DEBUG] Calling drawMapFeatures with marker position:",
          coords
        );
        setTimeout(() => {
          drawMapFeatures(map, barangayData, null, coords);
        }, 0);
      });

      // Cleanup this listener on dependency change
      return () => {
        if (map.clickListener) {
          window.google.maps.event.removeListener(map.clickListener);
          map.clickListener = null;
        }
      };
    }, [mapReady, barangayData]);

    // Handle defaultCoordinates separately
    useEffect(() => {
      if (!mapReady || !mapInstance.current || !defaultCoordinates) return;

      const map = mapInstance.current;
      const [lat, lng] = defaultCoordinates
        .split(",")
        .map((c) => parseFloat(c.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        setMarkerPosition({ lat, lng });
        markerPositionRef.current = { lat, lng };
        map.setCenter({ lat, lng });
        map.setZoom(17);
        drawMapFeatures(map, barangayData, null, { lat, lng }); // No highlight
      }
    }, [mapReady, defaultCoordinates, barangayData]);

    // Cleanup overlays on unmount
    useEffect(() => {
      return () => {
        overlaysRef.current.forEach((o) => o.setMap(null));
        overlaysRef.current = [];
        if (markerRef.current) markerRef.current.setMap(null);
      };
    }, []);

    // Redraw polygons/marker when highlightedBarangay or markerPosition changes
    useEffect(() => {
      console.log(
        "[MapPicker DEBUG] useEffect triggered - markerPosition:",
        markerPosition,
        "highlightedBarangay:",
        highlightedBarangay
      );
      if (!isDataLoaded || !mapInstance.current || !barangayData) {
        console.log("[MapPicker DEBUG] useEffect - missing dependencies:", {
          isDataLoaded,
          mapInstance: !!mapInstance.current,
          barangayData: !!barangayData,
        });
        return;
      }
      console.log("[MapPicker DEBUG] Calling drawMapFeatures from useEffect");
      drawMapFeatures(
        mapInstance.current,
        barangayData,
        highlightedBarangay,
        markerPosition
      );
    }, [
      highlightedBarangay,
      markerPosition,
      isDataLoaded,
      isGoogleMapsLoaded,
      barangayData,
    ]);

    // Toast timeout
    useEffect(() => {
      if (toast) {
        const timer = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(timer);
      }
    }, [toast]);

    return (
      <div className="relative w-full h-[400px]">
        {toast && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg shadow-md text-sm z-50 text-white text-[14px] text-center transition-opacity duration-500 opacity-100 ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : "bg-yellow-500"
            }`}
          >
            {toast.message}
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg border border-gray-200"
        />
      </div>
    );
  }
);

export default MapPicker;
