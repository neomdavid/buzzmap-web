import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Thermometer,
  Drop,
  Wind,
  CloudRain,
  CloudLightning,
  SunDim,
  WarningCircle,
  Clock,
  Megaphone,
  FirstAid,
  Skull,
  Sparkle,
  MagnifyingGlass,
  Lightbulb,
} from "phosphor-react";
import { motion, AnimatePresence } from "framer-motion";

// Pattern color mapping for both border and badge
const PATTERN_COLORS = {
  spike: { border: "border-error", badge: "bg-error", base: "error" },
  gradual_rise: {
    border: "border-warning",
    badge: "bg-warning",
    base: "warning",
  },
  stability: { border: "border-info", badge: "bg-info", base: "info" },
  decline: { border: "border-success", badge: "bg-success", base: "success" },
  low_level_activity: {
    border: "border-gray-400",
    badge: "bg-gray-400",
    base: "gray-400",
  },
  default: {
    border: "border-gray-400",
    badge: "bg-gray-400",
    base: "gray-400",
  },
};

const getPatternKey = (pattern) => {
  if (!pattern) return "default";
  const p = pattern.trim().toLowerCase();
  if (p === "spike") return "spike";
  if (p === "gradual_rise") return "gradual_rise";
  if (p === "stability") return "stability";
  if (p === "decline") return "decline";
  if (p === "low_level_activity") return "low_level_activity";
  return "default";
};

const getPatternLabel = (pattern) => {
  if (!pattern) return "No Pattern";
  switch (pattern.toLowerCase()) {
    case "spike":
      return "Spike";
    case "gradual_rise":
      return "Gradual Rise";
    case "stability":
      return "Stability";
    case "decline":
      return "Decline";
    case "low_level_activity":
      return "Low Level Activity";
    default:
      return "No Pattern";
  }
};

const RecommendationModal = ({
  barangayName,
  pattern_based,
  pattern_data,
  death_priority,
  aiRecommendations,
  recommendationLoading,
  recommendationError,
  showDetailedRecommendations,
  setShowDetailedRecommendations,
  onGenerateRecommendation,
}) => {
  const borderColor =
    PATTERN_COLORS[getPatternKey(pattern_based?.status)]?.border ||
    "border-gray-400";

  const badgeBgClass = borderColor.replace("border-", "bg-");
  const textColorClass = borderColor.replace("border-", "text-");
  // Pattern badge classes based on the actual pattern value
  const patternBadgeBorderClass =
    PATTERN_COLORS[getPatternKey(pattern_data?.pattern)]?.border ||
    "border-gray-300";
  const patternBadgeTextClass = patternBadgeBorderClass.replace(
    "border-",
    "text-"
  );
  const patternBadgeDotBgClass = patternBadgeBorderClass.replace(
    "border-",
    "bg-"
  );
  const [preview, setPreview] = useState({
    visible: false,
    uri: "",
    x: 0,
    y: 0,
    error: false,
  });
  const loadingMessages = [
    "Thinking…",
    "Considering key factors…",
    `Inspecting  ${barangayName}...`,
    `Consdering  ${getPatternLabel(pattern_data.pattern).toLowerCase()}...`,
    "Analyzing weather conditions…",
    "Checking death-based priority…",
    "Checking community-based reports...",
    "Gathering resources…",
    "Synthesizing action plan…",
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);

  // Normalized recommendation data (supports snake_case and camelCase)
  const reco = aiRecommendations?.[barangayName] || {};
  const weather = reco.weather_details || reco.weatherDetails || null;
  const summary = reco.summary || null;
  const recommendationHtml = reco.recommendation || null;
  const analysis = reco.analysis || null;
  const predictions = reco.predictions || null;
  const sources = reco.sources || [];
  const pattern = reco.pattern || pattern_data?.pattern;
  const reports =
    (typeof reco.reports === "number" ? reco.reports : pattern_data?.reports) ||
    0;
  const deaths =
    (typeof reco.deaths === "number" ? reco.deaths : death_priority?.count) ||
    0;
  const riskScores = {
    weather: reco.weather_risk_score ?? reco.weatherRiskScore ?? null,
    reports: reco.reports_risk_score ?? reco.reportsRiskScore ?? null,
    fatalities: reco.fatalities_risk_score ?? reco.fatalitiesRiskScore ?? null,
  };
  const availableRiskScores = Object.values(riskScores).filter(
    (v) => v !== null
  );
  const overallRisk = availableRiskScores.length
    ? Math.round(
        availableRiskScores.reduce((a, b) => {
          const scoreA = typeof a === "object" ? a.score : a;
          const scoreB = typeof b === "object" ? b.score : b;
          return scoreA + scoreB;
        }, 0) / availableRiskScores.length
      )
    : null;

  // Helper function to convert markdown recommendations to HTML
  const convertRecommendationsToHtml = (text) => {
    if (!text) return "";

    // Split into lines and process each line
    const lines = text.split("\n");
    let html = "";
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check if line starts with a bullet point
      if (trimmedLine.startsWith("*")) {
        // Start list if not already in one
        if (!inList) {
          html += '<ul class="list-disc list-inside space-y-2 mb-4">';
          inList = true;
        }

        // Convert markdown to HTML
        const content = trimmedLine
          .replace(/^\*\s+/, "") // Remove the * and spaces
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
          .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic text

        html += `<li>${content}</li>`;
      } else if (trimmedLine === "") {
        // Empty line - end list if we were in one
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += "<br>";
      } else {
        // Regular text line - end list if we were in one
        if (inList) {
          html += "</ul>";
          inList = false;
        }

        // Process regular text
        const processedLine = trimmedLine
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>");

        html += `<p class="mb-2">${processedLine}</p>`;
      }
    });

    // Close any open list
    if (inList) {
      html += "</ul>";
    }

    return html;
  };

  useEffect(() => {
    if (recommendationLoading[barangayName]) {
      setLoadingMsgIndex(0);
      const id = setInterval(() => {
        setLoadingMsgIndex((i) => (i + 1) % loadingMessages.length);
      }, 4000);
      return () => clearInterval(id);
    }
  }, [recommendationLoading[barangayName], barangayName]);

  return (
    <>
      <dialog id={`recommendations_modal_${barangayName}`} className="modal">
        <div
          className={`modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-5xl p-12 relative}`}
        >
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() =>
              document
                .getElementById(`recommendations_modal_${barangayName}`)
                .close()
            }
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
              className={`text-white text-center px-4 py-1 font-normal text-xl font-semibold ml-1 rounded-full ${badgeBgClass}`}
            >
              Barangay {barangayName}
            </span>
          </p>

          {/* Stats Badges in Modal */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {/* Pattern Badge - white background, colored border/text */}
            {pattern_data?.pattern && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-sm  font-medium border ${patternBadgeBorderClass} ${patternBadgeTextClass}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${patternBadgeDotBgClass}`}
                ></span>
                {getPatternLabel(pattern_data.pattern)}
              </div>
            )}

            {/* Reports Badge - white background */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-primary text-primary text-sm  font-medium">
              <Megaphone size={14} />
              {pattern_data?.reports || 0} Reports
            </div>

            {/* Deaths/Fatality Badge - white background */}
            {death_priority?.count > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-red-500 text-red-600 text-sm  font-medium">
                <Skull size={14} />
                {death_priority.count}{" "}
                {death_priority.count === 1 ? "Fatality" : "Fatalities"}
              </div>
            )}
          </div>

          <hr className="text-accent/50 mb-6" />

          <div className="max-h-[60vh] overflow-y-auto">
            {recommendationLoading[barangayName] && (
              <div className="flex flex-col items-center justify-center p-8 gap-2">
                <div className="flex items-center">
                  <span className="loading loading-spinner loading-lg text-primary mr-3"></span>
                  <span className="text-gray-700 text-lg font-medium">
                    Generating AI recommendations…
                  </span>
                </div>
                <div className="text-gray-500 text-md">
                  {loadingMessages[loadingMsgIndex]}
                </div>
              </div>
            )}

            {recommendationError?.[barangayName] &&
              !recommendationLoading[barangayName] && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
                  <div className="flex items-start gap-2">
                    <WarningCircle size={18} className="mt-0.5" />
                    <div>
                      <div className="font-semibold mb-1">
                        Failed to generate AI recommendations
                      </div>
                      <div className="text-sm mb-3">
                        {String(recommendationError[barangayName])}
                      </div>
                      <button
                        className="btn btn-xs btn-error text-white"
                        onClick={() => onGenerateRecommendation?.(barangayName)}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {Object.keys(reco).length > 0 &&
              !recommendationLoading[barangayName] && (
                <div className="space-y-4">
                  {/* Summary - Always visible */}
                  {summary && (
                    <div className="p-4 bg-base-300/60 rounded-lg">
                      <h4 className="font-semibold  mb-2 text-primary text-2xl font-bold">
                        Brief Insight
                      </h4>
                      <p className="text-primary text-md">{summary}</p>
                    </div>
                  )}

                  {/* Risk Assessment (compact) */}
                  {availableRiskScores.length > 0 && (
                    <div className="p-4 bg-primary rounded-lg border border-rose-200">
                      <div className="flex items-center">
                        <h4 className="font-semibold text-2xl text-white">
                          Risk Assessment
                        </h4>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {riskScores.weather && (
                          <div
                            className="p-3 rounded-lg border border-blue-200 bg-white cursor-help relative group"
                            title={
                              typeof riskScores.weather === "object" &&
                              riskScores.weather.reason
                                ? riskScores.weather.reason
                                : ""
                            }
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Thermometer
                                size={16}
                                className="text-blue-600"
                              />
                              <div className="text-[10px] uppercase font-semibold tracking-wide text-blue-600">
                                Weather
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 flex-1 bg-blue-100 rounded">
                                <div
                                  className="h-2 rounded bg-blue-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((typeof riskScores.weather === "object"
                                        ? riskScores.weather.score
                                        : riskScores.weather) /
                                        10) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="text-blue-800 font-semibold text-sm w-8 text-right">
                                {typeof riskScores.weather === "object"
                                  ? riskScores.weather.score
                                  : riskScores.weather}
                                /10
                              </div>
                            </div>
                            {/* Hover tooltip */}
                            {typeof riskScores.weather === "object" &&
                              riskScores.weather.reason && (
                                <div className="absolute top-full left-0 right-0 mt-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-left">
                                  {riskScores.weather.reason}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                                </div>
                              )}
                          </div>
                        )}
                        {riskScores.reports && (
                          <div
                            className="p-3 rounded-lg border border-amber-200 bg-white cursor-help relative group"
                            title={
                              typeof riskScores.reports === "object" &&
                              riskScores.reports.reason
                                ? riskScores.reports.reason
                                : ""
                            }
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Megaphone size={16} className="text-amber-600" />
                              <div className="text-[10px] uppercase font-semibold tracking-wide text-amber-600">
                                Reports
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 flex-1 bg-amber-100 rounded">
                                <div
                                  className="h-2 rounded bg-amber-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((typeof riskScores.reports === "object"
                                        ? riskScores.reports.score
                                        : riskScores.reports) /
                                        10) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="text-amber-800 font-semibold text-sm w-8 text-right">
                                {typeof riskScores.reports === "object"
                                  ? riskScores.reports.score
                                  : riskScores.reports}
                                /10
                              </div>
                            </div>
                            {/* Hover tooltip */}
                            {typeof riskScores.reports === "object" &&
                              riskScores.reports.reason && (
                                <div className="absolute top-full left-0 right-0 mt-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-left">
                                  {riskScores.reports.reason}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                                </div>
                              )}
                          </div>
                        )}
                        {riskScores.fatalities && (
                          <div
                            className="p-3 rounded-lg border border-red-200 bg-white cursor-help relative group"
                            title={
                              typeof riskScores.fatalities === "object" &&
                              riskScores.fatalities.reason
                                ? riskScores.fatalities.reason
                                : ""
                            }
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Skull size={16} className="text-red-600" />
                              <div className="text-[10px] uppercase font-semibold tracking-wide text-red-600">
                                Fatalities
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 flex-1 bg-red-100 rounded">
                                <div
                                  className="h-2 rounded bg-red-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((typeof riskScores.fatalities ===
                                      "object"
                                        ? riskScores.fatalities.score
                                        : riskScores.fatalities) /
                                        10) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <div className="text-red-800 font-semibold text-sm w-8 text-right">
                                {typeof riskScores.fatalities === "object"
                                  ? riskScores.fatalities.score
                                  : riskScores.fatalities}
                                /10
                              </div>
                            </div>
                            {/* Hover tooltip */}
                            {typeof riskScores.fatalities === "object" &&
                              riskScores.fatalities.reason && (
                                <div className="absolute top-full left-0 right-0 mt-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-left">
                                  {riskScores.fatalities.reason}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Weather - compact summary with expandable details */}
                  {weather && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-2xl mb-2 ">Weather</h4>
                        <button
                          onClick={() => setShowWeatherDetails((v) => !v)}
                          className="bg-primary rounded-2xl px-4 py-1 text-sm text-white hover:bg-primary/80 transition-all duration-300 cursor-pointer"
                        >
                          {showWeatherDetails ? "Hide" : "View"} details
                        </button>
                      </div>
                      {(() => {
                        const w = weather;
                        const verdict = w.verdict;
                        const verdictClass = verdict
                          ?.toLowerCase()
                          .includes("high")
                          ? "bg-red-50 border-red-200 text-red-800"
                          : verdict?.toLowerCase().includes("moderate")
                          ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                          : "bg-green-50 border-green-200 text-green-800";
                        const compact = [
                          {
                            label: "Temp",
                            value: w.temperature,
                            icon: (
                              <Thermometer
                                size={14}
                                className="text-gray-500"
                              />
                            ),
                          },
                          {
                            label: "Humidity",
                            value: w.humidity,
                            icon: <Drop size={14} className="text-gray-500" />,
                          },
                          {
                            label: "Chance of Rain",
                            value: w.chance_of_rain,
                            icon: (
                              <CloudRain size={14} className="text-gray-500" />
                            ),
                          },
                          {
                            label: "Condition",
                            value: w.condition,
                            icon: (
                              <CloudLightning
                                size={14}
                                className="text-gray-500"
                              />
                            ),
                          },
                        ]
                          .filter((i) => i.value)
                          .slice(0, 3);
                        return (
                          <div className="space-y-3">
                            {verdict && (
                              <div
                                className={`p-3 rounded-lg border ${verdictClass}`}
                              >
                                <div className="flex items-start gap-2">
                                  <WarningCircle size={18} className="mt-0.5" />
                                  <div>
                                    <div className="text-sm font-semibold mb-1">
                                      AI Insights
                                    </div>
                                    <div className="text-md leading-relaxed">
                                      {verdict}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {compact.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-800 inline-flex items-center gap-2"
                                >
                                  {it.icon}
                                  <span className="text-gray-500 text-sm">
                                    {it.label}:
                                  </span>
                                  <span className="font-semibold">
                                    {it.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <AnimatePresence initial={false}>
                              {showWeatherDetails && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                      {
                                        label: "Date & Time",
                                        value: w.date_and_time,
                                        icon: (
                                          <Clock
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "Temperature",
                                        value: w.temperature,
                                        icon: (
                                          <Thermometer
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "Humidity",
                                        value: w.humidity,
                                        icon: (
                                          <Drop
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "Wind Speed",
                                        value: w.wind_speed,
                                        icon: (
                                          <Wind
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "Precipitation",
                                        value: w.precipitation_level,
                                        icon: (
                                          <CloudRain
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "Chance of Rain",
                                        value: w.chance_of_rain,
                                        icon: (
                                          <CloudRain
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "Condition",
                                        value: w.condition,
                                        icon: (
                                          <CloudLightning
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                      {
                                        label: "UV Index",
                                        value:
                                          w.others?.uv_index ??
                                          w.others?.realfeel_heat_index,
                                        icon: (
                                          <SunDim
                                            size={16}
                                            className="text-gray-500"
                                          />
                                        ),
                                      },
                                    ]
                                      .filter((it) => it.value)
                                      .map((it, idx) => (
                                        <div
                                          key={idx}
                                          className="p-3 rounded-lg border border-gray-200 bg-white flex items-start gap-2"
                                        >
                                          <div className="mt-0.5">
                                            {it.icon}
                                          </div>
                                          <div>
                                            <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-0.5">
                                              {it.label}
                                            </div>
                                            <div className="text-gray-800 font-semibold text-sm">
                                              {it.value}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* View Detailed Recommendations Button */}
                  {recommendationHtml && (
                    <div className="text-center">
                      <button
                        onClick={() =>
                          setShowDetailedRecommendations((prev) => !prev)
                        }
                        className="btn btn-outline btn-primary flex items-center gap-2"
                      >
                        <span>
                          {showDetailedRecommendations ? "Hide" : "Read"}{" "}
                          Detailed Recommendations
                        </span>
                        <motion.div
                          animate={{
                            rotate: showDetailedRecommendations ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </motion.div>
                      </button>
                    </div>
                  )}

                  {/* Detailed Content - Conditionally visible */}
                  <AnimatePresence initial={false}>
                    {showDetailedRecommendations && recommendationHtml && (
                      <motion.div
                        id="detailed-recommendations"
                        initial={{ height: 0, opacity: 0, y: -20 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut",
                          height: { duration: 0.4 },
                          opacity: { duration: 0.3 },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-4">
                          {/* Main Recommendation */}
                          <div className="p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-2xl mb-3 text-primary">
                              Detailed Recommendations
                            </h4>
                            <div
                              className="text-gray-700 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html:
                                  convertRecommendationsToHtml(
                                    recommendationHtml
                                  ),
                              }}
                            />
                          </div>

                          {/* Analysis and Predictions (optional) */}
                          {(analysis || predictions) && (
                            <div className="flex gap-4">
                              {analysis && (
                                <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MagnifyingGlass
                                      size={20}
                                      className="text-gray-600"
                                    />
                                    <h4 className="font-semibold text-lg text-gray-800">
                                      Analysis
                                    </h4>
                                  </div>
                                  <div className="text-gray-700">
                                    <div
                                      className={`${
                                        !showAnalysisDetails
                                          ? "line-clamp-3"
                                          : ""
                                      }`}
                                    >
                                      {analysis}
                                    </div>
                                    <button
                                      onClick={() =>
                                        setShowAnalysisDetails((prev) => !prev)
                                      }
                                      className="text-primary hover:text-primary/80 text-sm font-medium mt-2 hover:underline"
                                    >
                                      {showAnalysisDetails
                                        ? "Show Less"
                                        : "Read More"}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {predictions && (
                                <div className="flex-1 p-4 bg-base-300 border border-primary/10 rounded-sm text-primary">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb
                                      size={20}
                                      className="text-primary"
                                    />
                                    <h4 className="font-semibold text-lg">
                                      Predictions
                                    </h4>
                                  </div>
                                  <div className="">
                                    <div
                                      className={`${
                                        !showPredictionDetails
                                          ? "line-clamp-3"
                                          : ""
                                      }`}
                                    >
                                      {predictions}
                                    </div>
                                    <button
                                      onClick={() =>
                                        setShowPredictionDetails(
                                          (prev) => !prev
                                        )
                                      }
                                      className="text-primary hover:text-primary/80 text-sm font-medium mt-2 hover:underline"
                                    >
                                      {showPredictionDetails
                                        ? "Show Less"
                                        : "Read More"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Key Factors */}
                          {reco.factors && reco.factors.length > 0 && (
                            <div className="p-4 rounded-lg">
                              <h4 className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-2xl text-primary">
                                  Key Factors Considered
                                </span>
                              </h4>
                              <ul className="flex flex-wrap gap-2">
                                {reco.factors.map((factor, index) => (
                                  <li
                                    key={index}
                                    className="inline-flex bg-primary text-white rounded-full px-3 py-1 text-sm font-medium"
                                  >
                                    {factor}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Sources as badges with hover preview (via fixed portal) */}
                          {sources && sources.length > 0 && (
                            <div className="p-4 rounded-lg">
                              <h4 className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-2xl text-primary">
                                  Sources
                                </span>
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {sources.map((source, index) => (
                                  <a
                                    key={index}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 text-primary text-sm font-semibold hover:bg-primary hover:text-white"
                                    title={source.title}
                                    onMouseEnter={(e) => {
                                      const x = Math.min(
                                        e.clientX + 16,
                                        window.innerWidth - 380
                                      );
                                      const y = Math.min(
                                        e.clientY + 16,
                                        window.innerHeight - 280
                                      );
                                      setPreview({
                                        visible: true,
                                        uri: source.uri,
                                        x,
                                        y,
                                        error: false,
                                      });
                                    }}
                                    onMouseMove={(e) => {
                                      const x = Math.min(
                                        e.clientX + 16,
                                        window.innerWidth - 380
                                      );
                                      const y = Math.min(
                                        e.clientY + 16,
                                        window.innerHeight - 280
                                      );
                                      setPreview((prev) => ({ ...prev, x, y }));
                                    }}
                                    onMouseLeave={() =>
                                      setPreview({
                                        visible: false,
                                        uri: "",
                                        x: 0,
                                        y: 0,
                                        error: false,
                                      })
                                    }
                                  >
                                    <span className="font-mono">
                                      [{index + 1}]
                                    </span>
                                    <span>{source.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            {!aiRecommendations[barangayName] &&
              !recommendationLoading[barangayName] && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    No AI recommendations available.
                  </p>
                </div>
              )}
          </div>

          <div className="modal-action mt-8">
            <form method="dialog">
              <button className="btn btn-primary text-white">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      {preview.visible &&
        createPortal(
          <div
            className="fixed z-[2147483647] pointer-events-none"
            style={{ left: preview.x, top: preview.y }}
          >
            <div className="w-[360px] h-[240px] bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden">
              {!preview.error ? (
                <iframe
                  src={preview.uri}
                  title="source-preview"
                  className="w-full h-full"
                  // sandbox is optional; removing can improve compatibility
                  onError={() =>
                    setPreview((prev) => ({ ...prev, error: true }))
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 text-center text-sm text-gray-600 bg-gray-50">
                  Preview not available for this site.
                </div>
              )}
            </div>
          </div>,
          (typeof window !== "undefined" &&
            document.getElementById(`recommendations_modal_${barangayName}`)) ||
            document.body
        )}
    </>
  );
};

export default RecommendationModal;
