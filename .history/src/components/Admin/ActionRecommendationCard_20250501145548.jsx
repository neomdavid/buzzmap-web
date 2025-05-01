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
  if (riskLevel === "medium") {
    bgColor = "bg-warning"; // medium risk (yellow)
  } else if (riskLevel === "low") {
    bgColor = "bg-success"; // low risk (green)
  }

  return (
    <div className="flex flex-col gap-1 border-2 border-error rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-error font-extrabold text-2xl">
          Barangay Commonwealth
        </p>
        <p className="bg-error text-center text-white py-1 px-4 rounded-xl">
          Immediate Action Needed
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-error ">
          <Circle weight="fill" />
        </div>
        <p className="text-error font-bold">
          <span className="font-semibold text-black">Risk Level: </span>
          High
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <MagnifyingGlass />
        </div>
        <p className="text-black">
          <span className="font-semibold">Issue Detected: </span>
          Spike in Breeding Site & Infestation Reports
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <Lightbulb weight="fill" />
        </div>
        <p className="text-black">
          <span className="font-semibold">Suggested Action: </span>
          Fogging Operation, Breeding Site Elimination
        </p>
      </div>
    </div>
  );
};

export default ActionRecommendationCard;
