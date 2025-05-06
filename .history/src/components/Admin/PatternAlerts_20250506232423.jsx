import { useState } from "react";
import { useGetPatternRecognitionResultsQuery } from "../../api/dengueApi";

const PatternAlerts = () => {
  const { data, isLoading, error } = useGetPatternRecognitionResultsQuery();
  const [filter, setFilter] = useState("all"); // 'all', 'spike', 'stability'

  if (isLoading) return <div>Loading alerts...</div>;
  if (error) return <div>Error loading alerts</div>;

  // Transform the API data
  const alerts = data.data
    .filter((alert) => alert.alert) // Only include items with alerts
    .map((alert) => {
      const patternType =
        alert.triggered_pattern?.toLowerCase() ||
        (alert.alert.includes("Stable")
          ? "stability"
          : alert.alert.includes("Spike")
          ? "spike"
          : "pattern");

      return {
        _id: alert._id,
        name: alert.name,
        alert: alert.alert,
        patternType: patternType,
        risk_level: alert.risk_level?.toLowerCase(),
      };
    });

  // Filter alerts based on selection
  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((alert) => alert.patternType === filter);

  // Format for AlertCard
  const formattedAlerts = filteredAlerts.map((alert) => {
    let messages = [];

    if (alert.patternType === "spike") {
      const percentageMatch = alert.alert.match(/(\d+)%/);
      const casesMatch = alert.alert.match(/\((\d+) → (\d+) cases\)/);

      if (percentageMatch && casesMatch) {
        messages = [
          {
            label: "Increase:",
            text: `${percentageMatch[1]}% from 7-day average`,
          },
          {
            label: "Cases:",
            text: `${casesMatch[1]} → ${casesMatch[2]}`,
          },
        ];
      } else {
        messages = [{ text: alert.alert.split(":")[1]?.trim() || "" }];
      }
    } else {
      messages = [{ text: alert.alert.split(":")[1]?.trim() || "" }];
    }

    return {
      title: `${alert.name}`,
      messages: messages,
      borderColor:
        alert.risk_level === "low" ? "border-success" : "border-error",
      bgColor: alert.risk_level === "low" ? "bg-success" : "bg-error",
    };
  });

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex space-x-2 mb-4">
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
          Spikes Only
        </button>
        <button
          onClick={() => setFilter("stability")}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === "stability" ? "bg-success text-white" : "bg-gray-200"
          }`}
        >
          Stability Only
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {formattedAlerts.length > 0 ? (
          formattedAlerts.map((alert, index) => (
            <AlertCard key={index} {...alert} />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No {filter === "all" ? "" : filter} alerts found
          </div>
        )}
      </div>
    </div>
  );
};

// Your original AlertCard component (unchanged)
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
