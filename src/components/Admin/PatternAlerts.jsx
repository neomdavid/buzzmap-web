import { useState, useMemo } from "react";
import { useGetPatternRecognitionResultsQuery } from "../../api/dengueApi";
import { MagnifyingGlass } from "phosphor-react";

export default function PatternAlerts({ selectedBarangay, selectedTab, onAlertSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: patternDataRaw, isLoading, error } = useGetPatternRecognitionResultsQuery();
  const patternData = patternDataRaw?.data || [];

  // Debug logs for initial data
  console.log('=== DEBUG LOGS ===');
  console.log('Selected Tab:', selectedTab);
  console.log('Selected Barangay:', selectedBarangay);
  console.log('Search Term:', searchTerm);
  console.log('Raw Pattern Data:', patternData);

  let filteredData = patternData;
  
  // First apply tab filtering
  if (selectedTab === "selected") {
    if (selectedBarangay) {
      filteredData = patternData.filter(
        item => item.name.toLowerCase() === selectedBarangay.toLowerCase()
      );
    } else {
      filteredData = [];
    }
  } else if (selectedTab === "all") {
    filteredData = patternData;
  } else if (selectedTab === "spikes") {
    filteredData = patternData.filter(item => {
      const patternType = item.triggered_pattern?.toLowerCase() || '';
      return patternType === 'spike';
    });
  } else if (selectedTab === "gradual") {
    filteredData = patternData.filter(item => {
      const patternType = item.triggered_pattern?.toLowerCase() || '';
      return patternType === 'gradual_rise';
    });
  } else if (selectedTab === "stability") {
    filteredData = patternData.filter(item => {
      const patternType = item.triggered_pattern?.toLowerCase() || '';
      return patternType === 'stability';
    });
  } else if (selectedTab === "decline") {
    filteredData = patternData.filter(item => {
      const patternType = item.triggered_pattern?.toLowerCase() || '';
      return patternType === 'decline' || patternType === 'decreasing';
    });
  }

  // Then apply search filtering
  if (searchTerm) {
    filteredData = filteredData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return item.name.toLowerCase().includes(searchLower);
    });
  }

  // Final debug log
  console.log('Final filtered data:', filteredData);
  console.log('=== END DEBUG LOGS ===');

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading pattern alerts.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full px-4">
      {/* Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search barangay..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        />
        <MagnifyingGlass
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {filteredData.length === 0 ? (
        <div className="text-gray-500">No alerts found.</div>
      ) : (
        filteredData.map(item => {
          // Determine colors based on pattern type
          let borderColor, bgColor;
          let messages = [];
          
          if (!item.triggered_pattern) {
            // No pattern data - use gray colors
            borderColor = "border-gray-300";
            bgColor = "bg-gray-300";
            messages = [
              { label: "Status:", text: "No pattern data recorded" }
            ];
          } else {
            // Has pattern data - use pattern-based colors
            if (item.triggered_pattern?.toLowerCase() === 'spike') {
              borderColor = "border-error";
              bgColor = "bg-error";
            } else if (item.triggered_pattern?.toLowerCase() === 'gradual_rise') {
              borderColor = "border-warning";
              bgColor = "bg-warning";
            } else if (item.triggered_pattern?.toLowerCase() === 'stability') {
              borderColor = "border-info";
              bgColor = "bg-info";
            } else if (item.triggered_pattern?.toLowerCase() === 'decline' || 
                      item.triggered_pattern?.toLowerCase() === 'decreasing') {
              borderColor = "border-success";
              bgColor = "bg-success";
            }

            // Remove barangay name from alert text
            const alertText = item.alert?.replace(/^[^:]+:\s*/, '') || '';

            messages = [
              { label: "Pattern Type:", text: item.triggered_pattern },
              { label: "Alert:", text: alertText }
            ];
          }

          return (
            <AlertCard
              key={item._id}
              title={item.name}
              borderColor={borderColor}
              bgColor={bgColor}
              messages={messages}
              barangayName={item.name}
              onSelect={onAlertSelect}
            />
          );
        })
      )}
    </div>
  );
}

// Your original AlertCard component (completely unchanged)
const AlertCard = ({
  title,
  messages = [],
  borderColor = "border-error",
  bgColor = "bg-error",
  barangayName,
  onSelect,
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
        <button 
          onClick={() => onSelect && onSelect(barangayName)}
          className="text-xs text-nowrap bg-base-content text-white font-light px-4 hover:cursor-pointer py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95"
        >
          Select
        </button>
      </div>
    </div>
  );
};
