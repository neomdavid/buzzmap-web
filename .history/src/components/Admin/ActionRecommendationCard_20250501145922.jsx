import React from "react";
import { Circle, MagnifyingGlass, Lightbulb } from "phosphor-react";

const ActionRecommendationCard = ({
  barangay,
  riskLevel,
  issue,
  suggestedAction,
  actionText, // New prop to pass dynamic action text
}) => {
  // Determine the background color and text color based on the risk level
  let bgColor = "bg-error"; // Default to 'high' risk (red)
  let textColor = "text-error"; // Default to 'high' risk (red text)

  if (riskLevel === "medium") {
    bgColor = "bg-warning"; // medium risk (yellow background)
    textColor = "text-warning"; // medium risk (yellow text)
  } else if (riskLevel === "low") {
    bgColor = "bg-success"; // low risk (green background)
    textColor = "text-success"; // low risk (green text)
  }

  return (
    <div className={`flex flex-col gap-1 border-2 ${bgColor} rounded-3xl p-6`}>
      <div className="flex items-center gap-2 mb-2">
        <p className="font-extrabold text-2xl">{barangay}</p>
        <p
          className={`${textColor} text-center text-white py-1 px-4 rounded-xl`}
        >
          {actionText} {/* Using the passed prop here */}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className={textColor}>
          <Circle weight="fill" />
        </div>
        <p className={`${textColor} font-bold`}>
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
          <span className="font-semibold">Suggested Action: </span>
          {suggestedAction}
        </p>
      </div>
    </div>
  );
};

export default ActionRecommendationCard;
