// Centralized pattern configuration for the entire application
// This file makes it easy to change pattern types in one place

// Standardized pattern types
export const PATTERN_TYPES = {
  SPIKE: "spike",
  INCREASE: "increase",
  DECREASE: "decrease",
  LOW_LEVEL_ACTIVITY: "low_level_activity",
  NO_CHANGE: "no_change",
  NONE: "none",
  DEFAULT: "default",
};

// Pattern color mapping for borders, badges, and backgrounds
export const PATTERN_COLORS = {
  [PATTERN_TYPES.SPIKE]: {
    border: "border-error",
    badge: "bg-error",
    text: "text-error",
    background: "bg-error/10",
    stroke: "#b60000",
    fill: "#b60000",
  },
  [PATTERN_TYPES.INCREASE]: {
    border: "border-warning",
    badge: "bg-warning",
    text: "text-warning",
    background: "bg-warning/10",
    stroke: "#40e17b",
    fill: "#40e17b",
  },
  [PATTERN_TYPES.DECREASE]: {
    border: "border-success",
    badge: "bg-success",
    text: "text-success",
    background: "bg-success/10",
    stroke: "#40e17b",
    fill: "#40e17b",
  },
  [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]: {
    border: "border-info",
    badge: "bg-info",
    text: "text-info",
    background: "bg-info/10",
    stroke: "#3182ce",
    fill: "#3182ce",
  },
  [PATTERN_TYPES.NO_CHANGE]: {
    border: "border-gray-400",
    badge: "bg-gray-400",
    text: "text-gray-400",
    background: "bg-gray-400/10",
    stroke: "#718096",
    fill: "#718096",
  },
  [PATTERN_TYPES.NONE]: {
    border: "border-gray-400",
    badge: "bg-gray-400",
    text: "text-gray-400",
    background: "bg-gray-400/10",
    stroke: "#718096",
    fill: "#718096",
  },
  [PATTERN_TYPES.DEFAULT]: {
    border: "border-gray-400",
    badge: "bg-gray-400",
    text: "text-gray-400",
    background: "bg-gray-400/10",
    stroke: "#718096",
    fill: "#718096",
  },
};

// Pattern display labels
export const PATTERN_LABELS = {
  [PATTERN_TYPES.SPIKE]: "Spike",
  [PATTERN_TYPES.INCREASE]: "Increase",
  [PATTERN_TYPES.DECREASE]: "Decrease",
  [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]: "Low Level Activity",
  [PATTERN_TYPES.NO_CHANGE]: "No Change",
  [PATTERN_TYPES.NONE]: "No Pattern",
  [PATTERN_TYPES.DEFAULT]: "No Pattern",
};

// Pattern descriptions for UI tooltips or help text
export const PATTERN_DESCRIPTIONS = {
  [PATTERN_TYPES.SPIKE]:
    "Sudden significant increase in dengue cases requiring immediate action",
  [PATTERN_TYPES.INCREASE]:
    "Gradual rise in dengue cases requiring attention soon",
  [PATTERN_TYPES.DECREASE]:
    "Declining trend in dengue cases, continue monitoring",
  [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]:
    "Low level of dengue activity, maintain current measures",
  [PATTERN_TYPES.NO_CHANGE]:
    "Stable dengue case levels, no immediate action required",
  [PATTERN_TYPES.NONE]: "No pattern detected in current data",
  [PATTERN_TYPES.DEFAULT]: "Pattern information not available",
};

// Pattern priority levels for sorting and recommendations
export const PATTERN_PRIORITY = {
  [PATTERN_TYPES.SPIKE]: 1, // Highest priority
  [PATTERN_TYPES.INCREASE]: 2, // High priority
  [PATTERN_TYPES.DECREASE]: 3, // Medium priority
  [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]: 4, // Low priority
  [PATTERN_TYPES.NO_CHANGE]: 5, // Lowest priority
  [PATTERN_TYPES.NONE]: 6, // No priority
  [PATTERN_TYPES.DEFAULT]: 6, // No priority
};

// Helper function to get pattern color by type
export const getPatternColor = (patternType, colorType = "border") => {
  const normalizedPattern = patternType?.toLowerCase();
  const pattern =
    PATTERN_COLORS[normalizedPattern] || PATTERN_COLORS[PATTERN_TYPES.DEFAULT];
  return pattern[colorType] || pattern.border;
};

// Helper function to get pattern label
export const getPatternLabel = (patternType) => {
  const normalizedPattern = patternType?.toLowerCase();
  return (
    PATTERN_LABELS[normalizedPattern] || PATTERN_LABELS[PATTERN_TYPES.DEFAULT]
  );
};

// Helper function to get pattern description
export const getPatternDescription = (patternType) => {
  const normalizedPattern = patternType?.toLowerCase();
  return (
    PATTERN_DESCRIPTIONS[normalizedPattern] ||
    PATTERN_DESCRIPTIONS[PATTERN_TYPES.DEFAULT]
  );
};

// Helper function to get pattern priority
export const getPatternPriority = (patternType) => {
  const normalizedPattern = patternType?.toLowerCase();
  return (
    PATTERN_PRIORITY[normalizedPattern] ||
    PATTERN_PRIORITY[PATTERN_TYPES.DEFAULT]
  );
};

// Helper function to normalize pattern types (for backward compatibility)
export const normalizePatternType = (patternType) => {
  if (!patternType) return PATTERN_TYPES.DEFAULT;

  const normalized = patternType.toLowerCase();

  // Handle old pattern types and normalize them
  if (normalized.includes("gradual") || normalized.includes("rise")) {
    return PATTERN_TYPES.INCREASE;
  }
  if (normalized.includes("decline")) {
    return PATTERN_TYPES.DECREASE;
  }
  if (normalized.includes("stability") || normalized.includes("stable")) {
    return PATTERN_TYPES.LOW_LEVEL_ACTIVITY;
  }
  if (normalized.includes("low_level")) {
    return PATTERN_TYPES.LOW_LEVEL_ACTIVITY;
  }
  if (normalized.includes("no_change") || normalized === "none") {
    return PATTERN_TYPES.NO_CHANGE;
  }
  if (normalized.includes("spike")) {
    return PATTERN_TYPES.SPIKE;
  }

  // Return the normalized pattern if it matches our standard types
  if (Object.values(PATTERN_TYPES).includes(normalized)) {
    return normalized;
  }

  return PATTERN_TYPES.DEFAULT;
};

// Export all pattern types as an array for easy iteration
export const PATTERN_TYPES_ARRAY = Object.values(PATTERN_TYPES);

// Export pattern types for tab values (used in Analytics and other components)
export const PATTERN_TAB_VALUES = {
  SELECTED: "selected",
  ALL: "all",
  SPIKES: "spikes",
  INCREASE: "increase",
  DECREASE: "decrease",
  LOW_LEVEL_ACTIVITY: "low_level_activity",
  NO_CHANGE: "no_change",
};

// Export pattern tabs configuration for easy use in components
export const PATTERN_TABS = [
  { label: "Selected Barangay", value: PATTERN_TAB_VALUES.SELECTED },
  { label: "All Alerts", value: PATTERN_TAB_VALUES.ALL },
  { label: "Spikes", value: PATTERN_TAB_VALUES.SPIKES },
  { label: "Increase", value: PATTERN_TAB_VALUES.INCREASE },
  { label: "Decrease", value: PATTERN_TAB_VALUES.DECREASE },
  { label: "Low Level Activity", value: PATTERN_TAB_VALUES.LOW_LEVEL_ACTIVITY },
  { label: "No Change", value: PATTERN_TAB_VALUES.NO_CHANGE },
];
