import * as turf from "@turf/turf";

// Color constants
export const PATTERN_COLORS = {
  low: "border-success bg-success/5",
  medium: "border-warning bg-warning/5",
  high: "border-error bg-error/5",
  unknown: "border-gray-400 bg-gray-100",
};

// Pattern colors for user map
export const USER_PATTERN_COLORS_MAP = {
  increase: "#e53e3e", // red (error) - for increasing cases
  decrease: "#38a169", // green (success) - for decreasing cases
  no_change: "#718096", // gray - for stable/no change/none status
  default: "#718096", // gray (fallback)
};

// Pattern colors for admin map
export const ADMIN_PATTERN_COLORS_MAP = {
  spike: "#e53e3e", // red
  increase: "#dd6b20", // orange
  decrease: "#38a169", // green
  low_level_activity: "#3182ce", // blue
  no_change: "#718096", // gray
  none: "#718096", // gray - default for no pattern
  default: "#718096", // gray - fallback
};

// Legacy export for backward compatibility
export const PATTERN_COLORS_MAP = ADMIN_PATTERN_COLORS_MAP;

export const INTERVENTION_STATUS_COLORS = {
  scheduled: "#8b5cf6", // Purple-500
  ongoing: "#f59e0b", // Amber-500
  default: "#6b7280", // Gray-500
};

export const INTERVENTION_TYPE_ICONS = {
  Fogging: "/src/assets/icons/fogging.svg",
  "Ovicidal-Larvicidal Trapping": "/src/assets/icons/trapping.svg",
  "Clean-up Drive": "/src/assets/icons/cleanup.svg",
  "Education Campaign": "/src/assets/icons/education.svg",
  default: "/src/assets/icons/fogging.svg",
};

export const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": "/src/assets/icons/stagnant_water.svg",
  "Standing Water": "/src/assets/icons/stagnant_water.svg", // Use same icon as stagnant water
  "Uncollected Garbage or Trash": "/src/assets/icons/garbage.svg",
  Others: "/src/assets/icons/others.svg",
  default: "/src/assets/icons/stagnant_water.svg",
};

// Helper function to normalize barangay names for comparison
export function normalizeBarangayName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\bsr\.?\b/g, "") // Remove sr. or sr
    .replace(/\bjr\.?\b/g, "") // Remove jr. or jr
    .replace(/[.\-']/g, "") // Remove periods, hyphens, apostrophes
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
}

// Helper function to pan to a position with offset
export function panToWithOffset(map, position, offsetY = 0.15) {
  if (!map || !position) return;
  const bounds = map.getBounds && map.getBounds();
  if (!bounds) {
    map.panTo(position);
    return;
  }
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const latSpan = ne.lat() - sw.lat();
  const newLat = position.lat + latSpan * offsetY;
  map.panTo({ lat: newLat, lng: position.lng });
}

export const QC_CENTER = { lat: 14.676, lng: 121.0437 };
