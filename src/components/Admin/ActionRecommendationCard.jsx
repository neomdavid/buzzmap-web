import React, { useState } from "react";
import {
  getPatternColor,
  getPatternLabel,
  normalizePatternType,
} from "../../utils/patternConfig";
import {
  Circle,
  MagnifyingGlass,
  Lightbulb,
  Warning,
  CheckCircle,
  Sparkle,
  Info,
  Skull,
} from "phosphor-react";
import {
  useGetAllInterventionsQuery,
  useGetRecommendationForInterventionQuery,
} from "../../api/dengueApi";
import { CheckCircle as LucideCheckCircle } from "lucide-react";

// Pattern functions now use centralized configuration from patternConfig.js

const PATTERN_STYLES = {
  spike: {
    bg: "bg-error",
    text: "text-error",
    border: "border-error",
    urgency: "Immediate Action Required",
  },
  increase: {
    bg: "bg-warning",
    text: "text-warning",
    border: "border-warning",
    urgency: "Action Required Soon",
  },
  decrease: {
    bg: "bg-success",
    text: "text-success",
    border: "border-success",
    urgency: "Continue Monitoring",
  },
  low_level_activity: {
    bg: "bg-info",
    text: "text-info",
    border: "border-info",
    urgency: "Monitor Situation",
  },
  no_change: {
    bg: "bg-gray-500",
    text: "text-gray-500",
    border: "border-gray-500",
    urgency: "No Specific Pattern",
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
  // Get all interventions
  const { data: allInterventions } = useGetAllInterventionsQuery();

  // AI recommendation state - only fetch when modal is opened
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const {
    data: aiRecommendation,
    isLoading: isLoadingAI,
    error: aiError,
  } = useGetRecommendationForInterventionQuery(barangay, {
    skip: !showAIRecommendations, // Only fetch when modal is opened
  });

  // Helper function to convert markdown recommendations to HTML
  const convertMarkdownToHtml = (text) => {
    if (!text) return "";

    // Split into lines and process each line
    const lines = text.split("\n");
    let html = "";
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check if line starts with markdown headers - convert to styled paragraphs instead of h1/h2/h3
      if (trimmedLine.startsWith("###")) {
        // End list if we were in one
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }

        const headerText = trimmedLine.replace(/^###+\s*/, "");
        html += `<p class="text-lg font-bold text-gray-800 mb-3 mt-6 border-l-4 border-info pl-3">${headerText}</p>`;
      } else if (trimmedLine.startsWith("##")) {
        // End list if we were in one
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }

        const headerText = trimmedLine.replace(/^##+\s*/, "");
        html += `<p class="text-xl font-bold text-gray-800 mb-4 mt-8 border-b-2 border-info pb-2">${headerText}</p>`;
      } else if (trimmedLine.startsWith("#")) {
        // End list if we were in one
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }

        const headerText = trimmedLine.replace(/^#+\s*/, "");
        html += `<p class="text-2xl font-bold text-gray-800 mb-6 mt-8 text-center bg-info/10 py-3 px-4 rounded-lg">${headerText}</p>`;
      }
      // Check if line is entirely wrapped in ** (treat as section header)
      else if (trimmedLine.match(/^\*\*.*\*\*$/)) {
        // End list if we were in one
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }

        const headerText = trimmedLine.replace(/^\*\*(.*)\*\*$/, "$1");
        html += `<p class="text-2xl font-bold text-gray-800 mb-4 mt-6 text-center bg-info/10 py-3 px-4 rounded-lg">${headerText}</p>`;
      }
      // Check if line starts with a bullet point or numbered list
      else if (trimmedLine.startsWith("*") || /^\d+\./.test(trimmedLine)) {
        // End previous list if switching types
        if (
          inList &&
          ((trimmedLine.startsWith("*") && !inList.startsWith("*")) ||
            (/^\d+\./.test(trimmedLine) && inList.startsWith("*")))
        ) {
          html += inList.startsWith("*") ? "</ul>" : "</ol>";
          inList = false;
        }

        // Start list if not already in one
        if (!inList) {
          if (trimmedLine.startsWith("*")) {
            html += '<ul class="list-disc list-inside space-y-2 mb-4">';
            inList = "ul";
          } else {
            html += '<ol class="list-decimal list-inside space-y-2 mb-4">';
            inList = "ol";
          }
        }

        // Convert markdown to HTML
        let content = trimmedLine;
        if (trimmedLine.startsWith("*")) {
          content = trimmedLine.replace(/^\*\s+/, ""); // Remove the * and spaces
        } else {
          content = trimmedLine.replace(/^\d+\.\s+/, ""); // Remove the number and spaces
        }

        // Apply formatting
        content = content
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
          .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic text

        const listTag = inList === "ul" ? "li" : "li";
        html += `<${listTag} class="text-gray-700 mb-2">${content}</${listTag}>`;
      } else if (trimmedLine === "") {
        // Empty line - end list if we were in one
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }
        html += "<br>";
      } else if (trimmedLine.match(/^[-*_]{3,}$/)) {
        // Horizontal rule
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }
        html += '<hr class="my-6 border-gray-300" />';
      } else {
        // Regular text line - end list if we were in one
        if (inList) {
          html += inList === "ul" ? "</ul>" : "</ol>";
          inList = false;
        }

        // Process regular text - handle bold, italic, and other formatting
        let processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
          .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic text
          .replace(
            /`(.*?)`/g,
            "<code class='bg-gray-100 px-1 py-0.5 rounded text-sm'>$1</code>"
          ) // Inline code
          .replace(
            /~~(.*?)~~/g,
            "<del class='line-through text-gray-500'>$1</del>"
          ); // Strikethrough

        // Only add paragraph tags if it's not empty and not just whitespace
        if (processedLine.trim()) {
          html += `<p class="mb-3 text-gray-700 leading-relaxed">${processedLine}</p>`;
        }
      }
    });

    // Close any open list
    if (inList) {
      html += inList === "ul" ? "</ul>" : "</ol>";
    }

    return html;
  };

  // Helper function to check if a date is within 2 weeks
  const isWithinTwoWeeks = (dateStr) => {
    const today = new Date();
    const interventionDate = new Date(dateStr);

    // Set time to start of day for both dates to compare only dates
    today.setHours(0, 0, 0, 0);
    interventionDate.setHours(0, 0, 0, 0);

    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    twoWeeksAgo.setHours(0, 0, 0, 0);

    const twoWeeksAhead = new Date(today);
    twoWeeksAhead.setDate(today.getDate() + 14);
    twoWeeksAhead.setHours(0, 0, 0, 0);

    const daysFromToday = Math.floor(
      (interventionDate - today) / (1000 * 60 * 60 * 24)
    );
    const isWithin = daysFromToday >= -14 && daysFromToday <= 14;

    console.log("[DEBUG] Date validation for", dateStr, ":");
    console.log("- Today:", today.toISOString());
    console.log("- Intervention date:", interventionDate.toISOString());
    console.log("- Days from today:", daysFromToday);
    console.log("- Two weeks ago:", twoWeeksAgo.toISOString());
    console.log("- Two weeks ahead:", twoWeeksAhead.toISOString());
    console.log("- Is within two weeks:", isWithin);

    return isWithin;
  };

  // Get all interventions for this barangay
  const barangayInterventions =
    allInterventions?.filter((i) => i.barangay === barangay) || [];

  // Debug each intervention's date validation
  console.log(`[DEBUG] Checking interventions for ${barangay}:`);
  barangayInterventions.forEach((i) => {
    console.log(`\nValidating intervention from ${i.date}:`);
    const isValid = isWithinTwoWeeks(i.date);
    console.log(`- Is within 2 weeks: ${isValid}`);
  });

  // Filter to only include interventions within the 2-week window
  const recentInterventions = barangayInterventions.filter((i) => {
    const isValid = isWithinTwoWeeks(i.date);
    console.log(
      `[DEBUG] Filtering intervention from ${i.date}: ${
        isValid ? "INCLUDED" : "EXCLUDED"
      }`
    );
    return isValid;
  });

  console.log(`[DEBUG] Summary for ${barangay}:`);
  console.log("- Total interventions:", barangayInterventions.length);
  console.log(
    "- Recent interventions (within 2 weeks):",
    recentInterventions.length
  );
  console.log(
    "- Recent intervention dates:",
    recentInterventions.map((i) => i.date)
  );

  const hasRecentIntervention = recentInterventions.length > 0;
  const latestRecentIntervention = hasRecentIntervention
    ? recentInterventions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  console.log(`[DEBUG] Final status for ${barangay}:`);
  console.log("- Has recent intervention:", hasRecentIntervention);
  console.log("- Latest recent intervention:", latestRecentIntervention?.date);
  console.log("- Latest status:", latestRecentIntervention?.status);

  // Show Apply button if there are no recent interventions
  const showApplyButton = !hasRecentIntervention;

  console.log(`[DEBUG] Button state for ${barangay}:`);
  console.log("- Show Apply button:", showApplyButton);
  console.log(
    "- Reason:",
    hasRecentIntervention
      ? "Has recent intervention"
      : "No recent interventions"
  );

  // Determine colors and urgency based on pattern type
  const patternType = normalizePatternType(pattern_based?.status) || "none";
  const styles = PATTERN_STYLES[patternType] || PATTERN_STYLES.none;
  const urgencyLevelToDisplay = styles.urgency;

  // Status badge styles
  const statusStyles = {
    Scheduled: "bg-info/10 text-info border-info/20",
    Ongoing: "bg-warning/10 text-warning border-warning/20",
    Complete: "bg-success/10 text-success border-success/20",
  };

  return (
    <div
      className={`flex flex-col gap-4 border-2 ${styles.border} rounded-3xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <p className={`${styles.text} font-extrabold text-2xl`}>{barangay}</p>
          {!hideSharedInfo && (
            <p
              className={`${styles.bg} text-center text-white py-1 px-4 rounded-xl text-sm`}
            >
              {urgencyLevelToDisplay}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(pattern_based?.admin_recommendation ||
            report_based?.admin_recommendation ||
            death_priority?.recommendation) && (
            <button
              onClick={() => {
                setShowAIRecommendations(true); // Trigger AI recommendation fetch
                document
                  .getElementById(`recommendations_modal_${barangay}`)
                  .showModal();
              }}
              className="px-3 py-1.5 bg-white border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors text-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkle size={14} className="text-primary" />
              View Recommendations
            </button>
          )}
          {hasRecentIntervention ? (
            <div
              className={`px-3 py-1.5 rounded-full border text-sm flex items-center gap-1.5 ${
                statusStyles[latestRecentIntervention.status]
              }`}
            >
              <LucideCheckCircle size={16} weight="fill" />
              {latestRecentIntervention.status}
            </div>
          ) : (
            onApply &&
            ["spike", "increase"].includes(patternType) &&
            showApplyButton && (
              <button
                onClick={() => onApply(barangay, pattern_based?.status)}
                className="px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm cursor-pointer"
              >
                Add Intervention
              </button>
            )
          )}
        </div>
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
              <p className="text-black">{pattern_based.alert}</p>
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
          {report_based.alert && report_based.alert !== "None" && (
            <div className="flex items-start gap-3 ml-6">
              <p className="text-black">{report_based.alert}</p>
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
          {death_priority.alert &&
            death_priority.alert.trim() !== "" &&
            !death_priority.alert.toLowerCase().includes("no deaths") && (
              <div className="flex items-start gap-3 ml-6">
                <p className="text-error">{death_priority.alert}</p>
              </div>
            )}
        </div>
      )}

      {/* Recommendations Modal */}
      <dialog id={`recommendations_modal_${barangay}`} className="modal">
        <div
          className={`modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-h-[90vh] overflow-y-auto max-w-5xl p-12 relative`}
        >
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => {
              document
                .getElementById(`recommendations_modal_${barangay}`)
                .close();
              // Reset AI recommendation state when modal is closed
              setShowAIRecommendations(false);
            }}
          >
            ✕
          </button>

          <div className="flex gap-2 items-center justify-center mb-3">
            <Sparkle size={20} className="text-primary" weight="bold" />
            <p className="text-center text-3xl font-bold text-primary">
              AI-Powered Recommendations
            </p>
          </div>
          <p className="text-center text-2xl font-bold mb-5">
            <span
              className={`text-white text-center px-4 py-1 font-normal text-xl font-semibold ml-1 rounded-full ${getPatternColor(
                normalizePatternType(pattern_based?.status),
                "badge"
              )}`}
            >
              Barangay {barangay}
            </span>
          </p>

          {/* Stats Badges in Modal */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {/* Pattern Badge - white background, colored border/text */}
            {pattern_based?.status && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-sm font-medium border ${getPatternColor(
                  normalizePatternType(pattern_based?.status),
                  "border"
                )} ${getPatternColor(
                  normalizePatternType(pattern_based?.status),
                  "text"
                )}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${getPatternColor(
                    normalizePatternType(pattern_based?.status),
                    "badge"
                  )}`}
                ></span>
                {getPatternLabel(pattern_based?.status)}
              </div>
            )}

            {/* Reports Badge - white background */}
            {report_based && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-primary text-primary text-sm font-medium">
                <MagnifyingGlass size={14} />
                {report_based.count || 0} Reports
              </div>
            )}

            {/* Deaths/Fatality Badge - white background */}
            {death_priority?.count > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-red-500 text-red-600 text-sm font-medium">
                <Skull size={14} />
                {death_priority.count}{" "}
                {death_priority.count === 1 ? "Fatality" : "Fatalities"}
              </div>
            )}
          </div>

          <hr className="text-accent/50 mb-2" />

          {/* Pattern Alert Section - if exists */}
          {pattern_based?.alert && (
            <div className="mb-6 p-4 flex justify-center items-center gap-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="text-primary" size={16} weight="bold" />
              </div>
              <p className="text-gray-700 text-md leading-relaxed">
                {pattern_based.alert}
              </p>
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            {/* AI Recommendations Section */}
            {isLoadingAI && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkle
                    size={20}
                    className="text-primary animate-pulse"
                    weight="bold"
                  />
                  <p className="text-xl font-semibold text-primary">
                    AI-Powered Recommendations
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <span className="loading loading-spinner loading-lg text-info"></span>
                      <span className="text-gray-700 text-lg font-medium">
                        Generating AI recommendations...
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      Analyzing data and creating personalized insights...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aiError && !isLoadingAI && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Warning size={20} className="text-error" />
                  <p className="text-xl font-semibold text-error">
                    AI Recommendations Unavailable
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Warning size={20} className="text-error" />
                      <span className="text-gray-700 font-medium">
                        Unable to load AI recommendations
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      Please try again later or contact support if the issue
                      persists.
                    </p>
                    <button
                      onClick={() => setShowAIRecommendations(true)}
                      className="btn btn-sm btn-info text-white"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {aiRecommendation?.recommendation && !isLoadingAI && !aiError && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkle
                    size={20}
                    className="text-primary animate-pulse"
                    weight="bold"
                  />
                  <p className="text-xl font-semibold text-primary">
                    AI-Powered Recommendations
                  </p>
                </div>
                <div className="bg-white p-4 pt-6 rounded-lg border border-gray-200 shadow-sm">
                  <div
                    className="text-gray-700 text-base leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: convertMarkdownToHtml(
                        aiRecommendation.recommendation
                      ),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Show this when modal is opened but AI recommendations haven't been fetched yet */}
            {showAIRecommendations &&
              !isLoadingAI &&
              !aiRecommendation?.recommendation &&
              !aiError && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkle size={20} className="text-info" />
                    <p className="text-xl font-semibold text-info">
                      AI-Powered Recommendations
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-center py-6">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Sparkle size={20} className="text-info" />
                        <span className="text-gray-700 font-medium">
                          Ready to generate AI recommendations
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">
                        Click the button below to start generating personalized
                        AI insights for this barangay.
                      </p>
                      <button
                        onClick={() => setShowAIRecommendations(true)}
                        className="btn btn-sm btn-info text-white"
                      >
                        Generate AI Recommendations
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* <p className="text-xl font-semibold mb-4">
              Pattern-Based Recommendations:
            </p>
            <ul className="list-disc list-inside space-y-4">
              {pattern_based?.admin_recommendation ? (
                pattern_based.admin_recommendation
                  .split("\n")
                  .filter((rec) => rec.trim())
                  .map((rec, index) => (
                    <li key={index} className="text-gray-700 text-lg">
                      {rec.trim().replace(/^- /, "")}
                    </li>
                  ))
              ) : (
                <li className="text-gray-700 text-lg">
                  No recommendations available.
                </li>
              )}
            </ul> */}
          </div>

          <div className="modal-action mt-8">
            <form method="dialog">
              <button
                className="btn btn-primary text-white"
                onClick={() => setShowAIRecommendations(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ActionRecommendationCard;
