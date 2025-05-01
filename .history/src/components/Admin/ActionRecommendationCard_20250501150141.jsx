import React from "react";
import { Circle, MagnifyingGlass, Lightbulb } from "@phosphor-react";

const ActionRecommendationCard = ({
  barangay,
  urgencyLevel = "Immediate Action Needed",
  riskLevel = "high", // 'high', 'medium', or 'low'
  issueDetected,
  suggestedAction,
  className = "",
}) => {
  // Determine colors based on risk level
  const getRiskColors = () => {
    switch (riskLevel.toLowerCase()) {
      case "high":
        return {
          bg: "bg-error",
          text: "text-error",
          border: "border-error",
        };
      case "medium":
        return {
          bg: "bg-warning",
          text: "text-warning",
          border: "border-warning",
        };
      case "low":
        return {
          bg: "bg-success",
          text: "text-success",
          border: "border-success",
        };
      default:
        return {
          bg: "bg-error",
          text: "text-error",
          border: "border-error",
        };
    }
  };

  const colors = getRiskColors();

  return (
    <div
      className={`flex flex-col gap-1 border-2 ${colors.border} rounded-3xl p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <p className={`${colors.text} font-extrabold text-2xl`}>{barangay}</p>
        <p
          className={`${colors.bg} text-center text-white py-1 px-4 rounded-xl`}
        >
          {urgencyLevel}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className={colors.text}>
          <Circle weight="fill" size={16} />
        </div>
        <p className={`${colors.text} font-bold`}>
          <span className="font-semibold text-black">Risk Level: </span>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
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
