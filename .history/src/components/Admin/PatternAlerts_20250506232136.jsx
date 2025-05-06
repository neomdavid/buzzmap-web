import { useGetPatternRecognitionResultsQuery } from "./api/dengueApi";

const PatternAlerts = () => {
  const { data, isLoading, error } = useGetPatternRecognitionResultsQuery();

  if (isLoading) return <div>Loading alerts...</div>;
  if (error) return <div>Error loading alerts</div>;

  // Transform the API data to match AlertCard's expected format
  const alerts = data.data
    .filter((alert) => alert.alert) // Only include items with alerts
    .map((alert) => {
      // Extract pattern type from triggered_pattern or alert message
      const patternType =
        alert.triggered_pattern ||
        (alert.alert.includes("Stable")
          ? "stability"
          : alert.alert.includes("Spike")
          ? "spike"
          : "pattern");

      // Create a more readable title
      const title = `${
        patternType.charAt(0).toUpperCase() + patternType.slice(1)
      } in ${alert.name}`;

      // Parse the alert message for better formatting
      let statusMessage = alert.alert.split(":")[1]?.trim() || "";

      // If it's a spike, extract the percentage and cases
      if (patternType === "spike") {
        const percentageMatch = statusMessage.match(/(\d+)%/);
        const casesMatch = statusMessage.match(/\((\d+) → (\d+) cases\)/);

        if (percentageMatch && casesMatch) {
          statusMessage = [
            {
              label: "Increase:",
              text: `${percentageMatch[1]}% from 7-day average`,
            },
            {
              label: "Cases:",
              text: `${casesMatch[1]} → ${casesMatch[2]}`,
            },
          ];
        }
      } else if (patternType === "stability") {
        statusMessage = [
          {
            label: "Status:",
            text: "No cases reported in the last 7 days",
          },
        ];
      }

      return {
        title: title,
        messages: Array.isArray(statusMessage)
          ? statusMessage
          : [{ text: statusMessage }],
        borderColor:
          alert.risk_level.toLowerCase() === "low"
            ? "border-success"
            : "border-error",
        bgColor:
          alert.risk_level.toLowerCase() === "low" ? "bg-success" : "bg-error",
        patternType: patternType,
      };
    });

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <AlertCard key={index} {...alert} />
      ))}
    </div>
  );
};

// Enhanced AlertCard component
const AlertCard = ({
  title,
  messages = [],
  borderColor = "border-error",
  bgColor = "bg-error",
  patternType = "pattern",
}) => {
  // Icon based on pattern type
  const getIcon = () => {
    switch (patternType) {
      case "spike":
        return (
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case "stability":
        return (
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative border-[2px] ${borderColor} rounded-2xl p-4 pt-10 text-black shadow-md`}
    >
      <div
        className={`absolute -top-3 left-4 flex items-center ${bgColor} rounded-xl font-semibold text-white p-1 px-4`}
      >
        {getIcon()}
        <span>{title}</span>
      </div>

      <div className="mt-2 space-y-1">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-start">
            {msg.label && (
              <span className="font-bold min-w-[80px] inline-block">
                {msg.label}
              </span>
            )}
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-3">
        <button className="text-xs bg-gray-800 text-white font-medium px-4 py-1.5 rounded-full transition-all duration-200 hover:bg-gray-700 active:scale-95">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PatternAlerts;
