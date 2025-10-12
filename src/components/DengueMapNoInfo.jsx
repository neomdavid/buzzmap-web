import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import DengueMap from "./DengueMap";
import center from "@turf/center";

const DengueMapNoInfo = forwardRef((props, ref) => {
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [mapRefState, setMapRefState] = useState(null);

  // Update useImperativeHandle to properly expose the map methods
  useImperativeHandle(
    ref,
    () => ({
      panTo: (position) => {
        if (mapRefState) {
          mapRefState.panTo(position);
        }
      },
      setZoom: (zoom) => {
        if (mapRefState) {
          mapRefState.setZoom(zoom);
        }
      },
    }),
    [mapRefState]
  );

  // Override the handlePolygonClick to not show InfoWindow
  const handlePolygonClick = (feature) => {
    const center = turf.center(feature.geometry);
    const { coordinates } = center.geometry;
    const [lng, lat] = coordinates;

    if (mapRefState && lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapRefState.panTo({ lat, lng });
    }

    // Set selected barangay and InfoWindow position
    setSelectedBarangay(feature);
    setInfoWindowPosition({ lat, lng });

    // Call onBarangaySelect with the feature
    if (props.onBarangaySelect) {
      props.onBarangaySelect(feature);
    }
  };

  // Custom InfoWindow component for DengueMapNoInfo
  const CustomInfoWindow = ({ feature, position, onClose }) => {
    const patternType = (
      feature?.properties?.patternType || "none"
    ).toLowerCase();
    const color =
      {
        spike: "#e53e3e", // error - red
        increase: "#dd6b20", // warning - orange
        decrease: "#38a169", // success - green
        low_level_activity: "#3182ce", // info - blue
        no_change: "#718096", // gray
        none: "#718096", // gray
      }[patternType] || "#718096";

    return (
      <div
        className="bg-white p-3 rounded-lg shadow-lg"
        style={{
          border: `2px solid ${color}`,
          minWidth: "200px",
          textAlign: "center",
        }}
      >
        <p className="font-bold text-3xl" style={{ color }}>
          {feature.properties.displayName}
        </p>
      </div>
    );
  };

  // Custom polygon options to highlight selected barangay
  const getPolygonOptions = (feature) => {
    const patternType = (
      feature?.properties?.patternType || "none"
    ).toLowerCase();
    const color =
      {
        spike: "#e53e3e",
        increase: "#dd6b20",
        decrease: "#38a169",
        low_level_activity: "#3182ce",
        no_change: "#718096",
        none: "#718096",
      }[patternType] || "#718096";

    const isSelected =
      selectedBarangay?.properties?.displayName ===
      feature.properties.displayName;

    return {
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: isSelected ? 3 : 1, // Thicker border for selected
      fillOpacity: 0.5,
      fillColor: color,
      zIndex: isSelected ? 6 : 5, // Higher z-index for selected
    };
  };

  // Clear search query when clicking on a barangay
  const handleBarangayClick = (feature) => {
    handlePolygonClick(feature);
    if (props.onSearchClear) {
      props.onSearchClear();
    }
  };

  // Update handleMapLoad
  const handleMapLoad = (map) => {
    setMapRefState(map);
    if (props.onMapLoad) {
      props.onMapLoad(map);
    }
  };

  // DEBUGGING: Log props being passed to DengueMap
  const propsToDengueMap = {
    ...props,
    handlePolygonClick: handleBarangayClick,
    selectedBarangay: null, // Don't pass selectedBarangay
    infoWindowPosition: null, // Don't pass infoWindowPosition
    getPolygonOptions: getPolygonOptions,
    onMapLoad: handleMapLoad,
    activeInterventions: props.activeInterventions,
    isLoadingInterventions: props.isLoadingInterventions,
    selectedMapItem: props.selectedMapItem,
    onBarangaySelect: props.onBarangaySelect,
    searchQuery: props.searchQuery,
    onSearchClear: props.onSearchClear,
  };

  // Add debug logging for props being passed to DengueMap
  useEffect(() => {
    // Debug logging removed
  }, [
    propsToDengueMap.activeInterventions,
    propsToDengueMap.isLoadingInterventions,
    propsToDengueMap.selectedMapItem,
  ]);

  return <DengueMap {...propsToDengueMap} />;
});

export default DengueMapNoInfo;
