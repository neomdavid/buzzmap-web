import React from "react";
import { Circle, MagnifyingGlass, Lightbulb, Warning } from "phosphor-react";

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
  pattern_based,
  report_based,
  death_priority,
  className = "",
  hideSharedInfo = false,
  onApply,
}) => {
  // Debug statements
  console.log('[ActionRecommendationCard DEBUG] Props:', {
    barangay,
    pattern_based,
    report_based,
    death_priority
  });

  // Determine colors and urgency based on pattern type
  const patternType = pattern_based?.status || "none";
  console.log('[ActionRecommendationCard DEBUG] Pattern Type:', {
    raw: pattern_based?.status,
    processed: patternType,
    lowercase: patternType?.toLowerCase()
  });

  const styles = PATTERN_STYLES[patternType?.toLowerCase()] || PATTERN_STYLES.none;
  console.log('[ActionRecommendationCard DEBUG] Selected Styles:', {
    patternType: patternType?.toLowerCase(),
    selectedStyle: styles
  });

  const urgencyLevelToDisplay = styles.urgency;

  return (
    <div className={`flex flex-col gap-4 border-2 ${styles.border} rounded-3xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <p className={`${styles.text} font-extrabold text-2xl`}>{barangay}</p>
        {!hideSharedInfo && (
          <p className={`${styles.bg} text-center text-white py-1 px-4 rounded-xl text-sm`}>
            {urgencyLevelToDisplay}
          </p>
        )}
      </div>

      {/* Pattern-based Section */}
      {pattern_based && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={styles.text}>
              <Circle weight="fill" size={16} />
            </div>
            <p className="font-bold text-lg">Pattern-Based</p>
          </div>
          {pattern_based.alert && (
            <div className="flex items-start gap-3 ml-6">
              <div className="text-primary pt-0.5">
                <MagnifyingGlass size={16} />
              </div>
              <p className="text-black">
                <span className="font-semibold">Alert: </span>
                {pattern_based.alert}
              </p>
            </div>
          )}
          {pattern_based.admin_recommendation && (
            <div className="flex items-start gap-3 ml-6">
              <div className="text-primary pt-1">
                <Lightbulb weight="fill" size={16} />
              </div>
              <div className="text-black">
                <span className="font-semibold">Recommendations: </span>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {pattern_based.admin_recommendation.split('\n')
                    .filter(rec => rec.trim())
                    .map((rec, index) => (
                      <li key={index}>{rec.trim().replace(/^- /, '')}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report-based Section */}
      {report_based && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <MagnifyingGlass size={16} />
            </div>
            <p className="font-bold text-lg">Report-Based</p>
          </div>
          {report_based.count > 0 && (
            <div className="flex items-start gap-3 ml-6">
              <p className="text-black">
                <span className="font-semibold">Reports: </span>
                {report_based.count}
              </p>
            </div>
          )}
          {report_based.alert && (
            <div className="flex items-start gap-3 ml-6">
              <p className="text-black">
                <span className="font-semibold">Alert: </span>
                {report_based.alert}
              </p>
            </div>
          )}
          {report_based.admin_recommendation && (
            <div className="flex items-start gap-3 ml-6">
              <div className="text-primary pt-1">
                <Lightbulb weight="fill" size={16} />
              </div>
              <div className="text-black">
                <span className="font-semibold">Recommendations: </span>
                <ul className="list-disc list-inside ml-4 mt-1">
                  {report_based.admin_recommendation.split('\n')
                    .filter(rec => rec.trim())
                    .map((rec, index) => (
                      <li key={index}>{rec.trim().replace(/^- /, '')}</li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Death Priority Section */}
      {death_priority && death_priority.count > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-error">
              <Warning weight="fill" size={16} />
            </div>
            <p className="font-bold text-lg text-error">Death Priority</p>
          </div>
          <div className="flex items-start gap-3 ml-6">
            <p className="text-error">
              <span className="font-semibold">Alert: </span>
              {death_priority.alert}
            </p>
          </div>
          {death_priority.recommendation && (
            <div className="flex items-start gap-3 ml-6">
              <div className="text-primary pt-1">
                <Lightbulb weight="fill" size={16} />
              </div>
              <div className="text-error">
                <span className="font-semibold">Recommendation: </span>
                {death_priority.recommendation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Button */}
      {['spike', 'gradual_rise'].includes(patternType?.toLowerCase()) && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => onApply && onApply(barangay, patternType)}
            className="bg-primary text-white px-4 py-2 rounded-full shadow font-semibold hover:bg-primary/80 transition-all"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionRecommendationCard;
