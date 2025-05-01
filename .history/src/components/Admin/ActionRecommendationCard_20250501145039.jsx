import React from "react";
import { Circle, MagnifyingGlass, Lightbulb } from "phosphor-react";

const ActionRecommendations = ({
  barangay,
  riskLevel,
  issue,
  suggestedAction,
}) => {
  // Define the background color based on risk level
  let bgColor = "bg-success"; // default to success (low)
  if (riskLevel === "high") {
    bgColor = "bg-error"; // high risk
  } else if (riskLevel === "medium") {
    bgColor = "bg-warning"; // medium risk
  }

  return (
    <div className="flex flex-col lg:flex-23">
      <p className="text-base-content text-4xl font-bold mb-4">
        Prescriptive Action Recommendations
      </p>
      <div
        className={`flex flex-col gap-1 border-2 ${bgColor} rounded-3xl p-6`}
      >
        <div className="flex items-center gap-2 mb-2">
          <p className="font-extrabold text-2xl">{barangay}</p>
          <p className={`text-white text-center py-1 px-4 rounded-xl`}>
            {riskLevel === "high"
              ? "Immediate Action Needed"
              : riskLevel === "medium"
              ? "Action Required"
              : "Monitor"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-error">
            <Circle weight="fill" />
          </div>
          <p className="text-error font-bold">
            <span className="font-semibold text-black">Risk Level: </span>
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
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
            <span className="font-semibold">Suggested Action: </span>
            {suggestedAction}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionRecommendations;
