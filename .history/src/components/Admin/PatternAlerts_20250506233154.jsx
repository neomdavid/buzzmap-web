import { useState } from "react";
import { useGetPatternRecognitionResultsQuery } from "../../api/dengueApi";

const PatternAlerts = () => {
  const { data, isLoading, error } = useGetPatternRecognitionResultsQuery();
  const [filter, setFilter] = useState("all"); // 'all', 'spike', 'gradual_rise', 'decline', 'stability'

  if (isLoading) return <div>Loading alerts...</div>;
  if (error) return <div>Error loading alerts</div>;

  // Transform the API data
  const alerts = data.data
    .filter((alert) => alert.alert)
    .map((alert) => ({
      ...alert,
      // Normalize pattern types to match your Python code
      patternType:
        alert.triggered_pattern?.toLowerCase() ||
        (alert.alert.includes("Stable")
          ? "stability"
          : alert.alert.includes("Gradual")
          ? "gradual_rise"
          : alert.alert.includes("Decline")
          ? "decline"
          : alert.alert.includes("Spike")
          ? "spike"
          : "other"),
    }));

  // Filter alerts based on selection
  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((alert) => alert.patternType === filter);

  // Format for AlertCard with proper message parsing
  const formattedAlerts = filteredAlerts.map((alert) => {
    let messages = [];
    let title = alert.name;

    switch (alert.patternType) {
      case "spike":
        const spikeMatch = alert.alert.match(/(\d+)%/);
        const casesMatch = alert.alert.match(/\((\d+) → (\d+) cases\)/);
        messages = [
          { label: "Status:", text: "Dengue Spike Detected" },
          {
            label: "Increase:",
            text: spikeMatch
              ? `${spikeMatch[1]}% from average`
              : "Significant increase",
          },
          {
            label: "Cases:",
            text: casesMatch
              ? `${casesMatch[1]} → ${casesMatch[2]}`
              : "Case increase",
          },
        ];
        break;

      case "gradual_rise":
        messages = [
          { label: "Status:", text: "Gradual Rise Observed" },
          { text: alert.alert.split(":")[1]?.trim() || "" },
        ];
        break;

      case "decline":
        const declineMatch = alert.alert.match(/(\d+)%/);
        messages = [
          { label: "Status:", text: "Case Decline Detected" },
          {
            label: "Decrease:",
            text: declineMatch
              ? `${declineMatch[1]}% reduction`
              : "Significant decrease",
          },
        ];
        break;

      case "stability":
        messages = [
          { label: "Status:", text: "Stable - No cases reported" },
          { text: alert.alert.split(":")[1]?.trim() || "" },
        ];
        break;

      default:
        messages = [{ text: alert.alert }];
    }

    return {
      title: title,
      messages: messages,
      borderColor:
        alert.risk_level?.toLowerCase() === "low" &&
        alert.patternType === "decline"
          ? "border-success"
          : alert.risk_level?.toLowerCase() === "low"
          ? "border-info"
          : alert.risk_level?.toLowerCase() === "high"
          ? "border-error"
          : "border-warning",
      bgColor:
        alert.risk_level?.toLowerCase() === "low"
          ? "bg-success"
          : alert.risk_level?.toLowerCase() === "high"
          ? "bg-error"
          : "bg-warning",
    };
  });

  return (
    <div>
      {/* Filter Controls - Now with 4 categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "all" ? "bg-primary text-white" : "bg-gray-200"
          }`}
        >
          All Alerts
        </button>
        <button
          onClick={() => setFilter("spike")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "spike" ? "bg-error text-white" : "bg-gray-200"
          }`}
        >
          Spikes
        </button>
        <button
          onClick={() => setFilter("gradual_rise")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "gradual_rise" ? "bg-warning text-white" : "bg-gray-200"
          }`}
        >
          Gradual Rise
        </button>
        <button
          onClick={() => setFilter("decline")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "decline" ? "bg-success text-white" : "bg-gray-200"
          }`}
        >
          Declines
        </button>
        <button
          onClick={() => setFilter("stability")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "stability" ? "bg-info text-white" : "bg-gray-200"
          }`}
        >
          Stability
        </button>
      </div>

      {/* Alerts List - Using your original AlertCard */}
      <div className="space-y-4">
        {formattedAlerts.length > 0 ? (
          formattedAlerts.map((alert, index) => (
            <AlertCard key={index} {...alert} />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No {filter === "all" ? "" : filter.replace("_", " ")} alerts found
          </div>
        )}
      </div>
    </div>
  );
};

// Your original AlertCard component (completely unchanged)
const AlertCard = ({
  title,
  messages = [],
  borderColor = "border-error",
  bgColor = "bg-error",
}) => {
  return (
    <div
      className={`relative border-[2px] ${borderColor} rounded-4xl p-4 pt-10 text-black`}
    >
      <p
        className={`absolute text-lg left-[-2px] top-[-6px] text-nowrap ${bgColor} rounded-2xl font-semibold text-white p-1 px-4`}
      >
        {title}
      </p>
      {messages.map((msg, index) => (
        <p key={index}>
          {msg.label && <span className="font-bold">{msg.label}</span>}{" "}
          {msg.text}
        </p>
      ))}
      <div className="flex justify-end mt-1">
        <button className="text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PatternAlerts;
