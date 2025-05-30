import React from "react";
import { Circle, MagnifyingGlass, Lightbulb } from "phosphor-react";

const ActionRecommendationCard = ({
  barangay,
  riskLevel,
  issue,
  suggestedAction,
}) => {
  // Define the background color based on risk level
  let bgColor = "bg-error"; // Default to high risk (red)
  let actionText = "Immediate Action Needed"; // Default action text for high risk
  if (riskLevel === "medium") {
    bgColor = "bg-warning"; // medium risk (yellow)
    actionText = "Action Required";
  } else if (riskLevel === "low") {
    bgColor = "bg-success"; // low risk (green)
    actionText = "Monitor";
  }

  return (
    <div className={`flex flex-col gap-1 border-2 ${bgColor} rounded-3xl p-6`}>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-extrabold text-2xl">{barangay}</p>
        <p className="bg-white text-center text-black py-1 px-4 rounded-xl">
          {actionText}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-error">
          <Circle weight="fill" />
        </div>
        <p className="text-error font-bold">
          <span className="font-semibold text-black">Risk Level: </span>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}{" "}
          {/* Capitalized */}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <MagnifyingGlass />
        </div>
        <p className="text-black">
          <span className="font-semibold">Issue Detected: </span>
          {issue}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <Lightbulb weight="fill" />
        </div>
        <p className="text-black">
          <span className="font-semibold">Suggested Actions: </span>
          {suggestedAction}
        </p>
      </div>
    </div>
  );
};

export default ActionRecommendationCard;
