import React from "react";
import GradientText from "../../../Reactbits/GradientText/GradientText.jsx";
import { Sparkle, Megaphone, Skull } from "phosphor-react";
import {
  getPatternColor,
  getPatternLabel,
  normalizePatternType,
} from "../../utils/patternConfig";

const AlertCard = ({
  title,
  pattern_based,
  report_based,
  death_priority,
  pattern_data,
  last_analysis_time,
  barangayName,
  onSelect,
  onGenerateRecommendation,
  setRecommendationLoading,
  recommendationLoading,
  aiRecommendations,
}) => {
  const getPatternBadgeColor = (pattern) => {
    if (!pattern) return "border-gray-300";
    const normalizedPattern = normalizePatternType(pattern);
    return getPatternColor(normalizedPattern, "border");
  };

  const getPatternLabelText = (pattern) => {
    if (!pattern) return "No Pattern";
    const normalizedPattern = normalizePatternType(pattern);
    return getPatternLabel(normalizedPattern);
  };

  const borderColor = getPatternBadgeColor(pattern_data?.pattern);
  const badgeBgClass = borderColor.replace("border-", "bg-");

  return (
    <div
      className={`relative border-[2px] ${borderColor} rounded-4xl p-4 pt-10 text-black`}
    >
      <p
        className={`absolute text-lg left-[-2px] top-[-6px] text-nowrap ${badgeBgClass} rounded-2xl font-semibold text-white p-1 px-4`}
      >
        {title}
      </p>

      {/* Pattern display */}
      {pattern_data?.pattern && (
        <div className="mb-2">
          <span className="font-bold">Pattern:</span>{" "}
          {getPatternLabelText(pattern_data.pattern)}
        </div>
      )}

      {/* Counts (from route data, not AI) */}
      {(typeof report_based?.count === "number" ||
        (typeof death_priority?.count === "number" &&
          death_priority.count > 0)) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {typeof report_based?.count === "number" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-neutral-content text-neutral-content text-xs font-medium">
              <Megaphone size={14} />
              <span className="font-semibold">{report_based.count}</span>
              <span className="">Reports</span>
            </div>
          )}
          {typeof death_priority?.count === "number" &&
            death_priority.count > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-error text-error text-xs font-medium">
                <Skull size={14} />
                <span className="font-semibold">{death_priority.count}</span>
                <span className="">
                  {death_priority.count === 1 ? "Death" : "Deaths"}
                </span>
              </div>
            )}
        </div>
      )}

      {/* Last analysis time */}
      {last_analysis_time && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <span className="font-bold mb-1 text-base-content text-lg">
            Last Analyzed:
          </span>{" "}
          {new Date(last_analysis_time).toLocaleString()}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={() => {
            // Set loading state immediately and open modal
            setRecommendationLoading((prev) => ({
              ...prev,
              [barangayName]: true,
            }));
            document
              .getElementById(`recommendations_modal_${barangayName}`)
              .showModal();

            // Generate AI recommendation if not already generated
            if (!aiRecommendations[barangayName]) {
              onGenerateRecommendation(barangayName);
            } else {
              // If already generated, just stop loading
              setRecommendationLoading((prev) => ({
                ...prev,
                [barangayName]: false,
              }));
            }
          }}
          className={`px-4 py-2 rounded-full text-sm font-semibold  flex gap-2 border border-primary  transition-all hover:border-primary hover:border-1.5 duration-300`}
        >
          <Sparkle size={16} className="text-primary opacity-60" />
          <GradientText
            colors={["#245261", "#245261", "#245261", "#F8A900", "#F8A900"]}
            animationSpeed={6}
            showBorder={false}
            className=""
          >
            View AI Recommendations
          </GradientText>
        </button>
        <button
          onClick={() => onSelect(title)}
          className="px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm cursor-pointer"
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
