import React from "react";
import { Circle, MagnifyingGlass, Lightbulb } from "phosphor-react";

const PATTERN_STYLES = {
  spike: {
    bg: "bg-error",
    text: "text-error",
    border: "border-error",
    urgency: "Immediate Action Required",
  },
  gradual_rise: {
    bg: "bg-warning",
    text: "text-warning",
    border: "border-warning",
    urgency: "Action Required Soon",
  },
  stability: {
    bg: "bg-info",
    text: "text-info",
    border: "border-info",
    urgency: "Monitor Situation",
  },
  decline: {
    bg: "bg-success",
    text: "text-success",
    border: "border-success",
    urgency: "Continue Monitoring",
  },
  none: {
    bg: "bg-gray-500",
    text: "text-gray-500",
    border: "border-gray-500",
    urgency: "No Specific Pattern",
  },
};

const ActionRecommendationCard = ({
  barangay,
  patternType = "none", // Default to 'none'
  issueDetected,
  suggestedAction,
  className = "",
}) => {
  // Determine colors and urgency based on pattern type
  const styles = PATTERN_STYLES[patternType?.toLowerCase()] || PATTERN_STYLES.none;
  const urgencyLevelToDisplay = styles.urgency;

  return (
    <div
      className={`flex flex-col gap-1 border-2 ${styles.border} rounded-3xl p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <p className={`${styles.text} font-extrabold text-2xl`}>{barangay}</p>
        <p
          className={`${styles.bg} text-center text-white py-1 px-4 rounded-xl text-sm`}
        >
          {urgencyLevelToDisplay} 
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className={styles.text}>
          <Circle weight="fill" size={16} />
        </div>
        <p className={`${styles.text} font-bold`}>
          <span className="font-semibold text-black">Pattern: </span>
          {patternType.charAt(0).toUpperCase() + patternType.slice(1).replace('_', ' ')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <MagnifyingGlass size={16} />
        </div>
        <p className="text-black">
          <span className="font-semibold">Issue Detected: </span>
          {issueDetected}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <Lightbulb weight="fill" size={16} />
        </div>
        <p className="text-black">
          <span className="font-semibold">Suggested Action: </span>
          {suggestedAction}
        </p>
      </div>
    </div>
  );
};

export default ActionRecommendationCard;
