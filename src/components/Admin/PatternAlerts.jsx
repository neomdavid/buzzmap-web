import { useState, useMemo } from "react";
import { useGetBarangaysQuery } from "../../api/dengueApi";
import { MagnifyingGlass } from "phosphor-react";

export default function PatternAlerts({ selectedBarangay, selectedTab, onAlertSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: barangaysData, isLoading, error } = useGetBarangaysQuery();

  // Merge pattern data with barangay data (now only barangaysData)
  const patternData = useMemo(() => {
    if (!barangaysData) return [];
    return barangaysData.map(barangay => {
      const patternBased = barangay.status_and_recommendation?.pattern_based;
      const reportBased = barangay.status_and_recommendation?.report_based;
      const deathPriority = barangay.status_and_recommendation?.death_priority;
      return {
        _id: barangay._id,
        name: barangay.name,
        pattern_based: patternBased,
        report_based: reportBased,
        death_priority: deathPriority,
        pattern_data: barangay.pattern_data,
        last_analysis_time: barangay.last_analysis_time
      };
    });
  }, [barangaysData]);

  // Filter data based on search term and selected tab
  const filteredData = useMemo(() => {
    if (!patternData) return [];
    let filtered = patternData;
    // Apply search filter if search term exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower)
      );
    }
    // Apply tab filter using pattern_based.status
    if (selectedTab === 'spikes') {
      filtered = filtered.filter(item => 
        item.pattern_based?.status?.toLowerCase() === 'spike'
      );
    } else if (selectedTab === 'gradual') {
      filtered = filtered.filter(item => 
        item.pattern_based?.status?.toLowerCase() === 'gradual_rise'
      );
    } else if (selectedTab === 'stability') {
      filtered = filtered.filter(item => 
        item.pattern_based?.status?.toLowerCase() === 'stability' || 
        item.pattern_based?.status?.toLowerCase() === 'stable'
      );
    } else if (selectedTab === 'decline') {
      filtered = filtered.filter(item => 
        item.pattern_based?.status?.toLowerCase() === 'decline' || 
        item.pattern_based?.status?.toLowerCase() === 'decreasing'
      );
    } else if (selectedTab === 'selected' && selectedBarangay) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase() === selectedBarangay.toLowerCase()
      );
    }
    return filtered;
  }, [patternData, searchTerm, selectedTab, selectedBarangay]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading data.</div>;
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
          let borderColor, bgColor;
          let patternType = item.pattern_based?.status || '';
          if (!patternType || patternType.trim() === '') {
            borderColor = "border-gray-300";
            bgColor = "bg-gray-300";
          } else {
            const patternTypeLower = patternType.toLowerCase();
            if (patternTypeLower === 'spike') {
              borderColor = "border-error";
              bgColor = "bg-error";
            } else if (patternTypeLower === 'gradual_rise') {
              borderColor = "border-warning";
              bgColor = "bg-warning";
            } else if (patternTypeLower === 'stability' || patternTypeLower === 'stable') {
              borderColor = "border-info";
              bgColor = "bg-info";
            } else if (patternTypeLower === 'decline' || patternTypeLower === 'decreasing') {
              borderColor = "border-success";
              bgColor = "bg-success";
            } else {
              borderColor = "border-gray-300";
              bgColor = "bg-gray-300";
            }
          }
          return (
            <AlertCard
              key={item._id}
              title={item.name}
              borderColor={borderColor}
              bgColor={bgColor}
              pattern_based={item.pattern_based}
              report_based={item.report_based}
              death_priority={item.death_priority}
              pattern_data={item.pattern_data}
              last_analysis_time={item.last_analysis_time}
              barangayName={item.name}
              onSelect={onAlertSelect}
            />
          );
        })
      )}
    </div>
  );
}

// Pattern color mapping for both border and badge
const PATTERN_COLORS = {
  spike: { border: 'border-error', badge: 'bg-error' },
  gradual_rise: { border: 'border-warning', badge: 'bg-warning' },
  stability: { border: 'border-info', badge: 'bg-info' },
  decline: { border: 'border-success', badge: 'bg-success' },
  default: { border: 'border-gray-400', badge: 'bg-gray-400' }
};

const getPatternKey = (pattern) => {
  if (!pattern) return 'default';
  const p = pattern.trim().toLowerCase();
  if (p === 'spike') return 'spike';
  if (p === 'gradual_rise') return 'gradual_rise';
  if (p === 'stability' || p === 'stable') return 'stability';
  if (p === 'decline' || p === 'decreasing') return 'decline';
  return 'default';
};

// Enhanced AlertCard to show all alert types if present
const AlertCard = ({
  title,
  pattern_based,
  report_based,
  death_priority,
  pattern_data,
  last_analysis_time,
  barangayName,
  onSelect,
}) => {
  // Helper to check if a section has meaningful content
  const hasContent = (obj, extraCheck = null) => {
    if (!obj) return false;
    const fields = [obj.status, obj.alert, obj.recommendation];
    const hasString = fields.some(
      v => v && typeof v === 'string' && v.trim() !== '' && v.trim().toLowerCase() !== 'none'
    );
    if (extraCheck) return hasString || extraCheck(obj);
    return hasString;
  };
  const hasReportBased = hasContent(report_based, (rb) => typeof rb.count === 'number' && rb.count > 0);
  const hasDeathPriority = hasContent(death_priority);
  // Only show pattern-based if status is non-empty, non-null, non-'none'
  const showPatternBased = pattern_based && pattern_based.status && pattern_based.status.trim() !== '' && pattern_based.status.trim().toLowerCase() !== 'none';

  const getPatternBadgeColor = (pattern) => {
    if (!pattern) return '#a0aec0'; // gray
    const p = pattern.trim().toLowerCase();
    if (p === 'spike') return '#e53e3e'; // red
    if (p === 'gradual_rise') return '#f59e42'; // orange
    if (p === 'stability' || p === 'stable') return '#3b82f6'; // blue
    if (p === 'decline' || p === 'decreasing') return '#22c55e'; // green
    return '#a0aec0'; // gray
  };

  // Human-readable pattern label
  const getPatternLabel = (pattern) => {
    if (!pattern) return '';
    const p = pattern.trim().toLowerCase();
    if (p === 'spike') return 'Spike';
    if (p === 'gradual_rise') return 'Gradual Rise';
    if (p === 'stability' || p === 'stable') return 'Stability';
    if (p === 'decline' || p === 'decreasing') return 'Decline';
    return pattern.charAt(0).toUpperCase() + pattern.slice(1).replace(/_/g, ' ');
  };

  // Get pattern from pattern_based.status
  const patternKey = getPatternKey(pattern_based?.status);
  const borderColor = PATTERN_COLORS[patternKey].border;
  const badgeBgClass = PATTERN_COLORS[patternKey].badge;

  return (
    <div
      className={`relative border-[2px] ${borderColor} rounded-4xl p-4 pt-10 text-black`}
    >
      <p
        className={`absolute text-lg left-[-2px] top-[-6px] text-nowrap ${borderColor.replace('border-', 'bg-')} rounded-2xl font-semibold text-white p-1 px-4`}
      >
        {title}
      </p>
      {/* Pattern display using pattern_based.status */}
      {pattern_based?.status && pattern_based.status.trim() !== '' && (
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold mb-1 text-base-content text-lg">Pattern:</span>
          <span
            className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${badgeBgClass}`}
          >
            {getPatternLabel(pattern_based.status)}
          </span>
        </div>
      )}
      {/* Pattern-based section (only if status is non-empty) */}
      {showPatternBased && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <div className="font-bold mb-1 text-base-content text-lg">Pattern-Based</div>
          {pattern_based.status && pattern_based.status.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Status:</span> {pattern_based.status}</div>}
          {pattern_based.alert && pattern_based.alert.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Alert:</span> {pattern_based.alert}</div>}
          {pattern_based.recommendation && pattern_based.recommendation.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Recommendation:</span> {pattern_based.recommendation}</div>}
        </div>
      )}
      {/* Report-based section */}
      {report_based && hasReportBased && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <div className="font-bold mb-1 text-base-content text-lg">Report-Based</div>
          {typeof report_based.count === 'number' && report_based.count > 0 && <div><span className="font-bold">Reports:</span> {report_based.count}</div>}
          {report_based.status && report_based.status.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Status:</span> {report_based.status}</div>}
          {report_based.alert && report_based.alert.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Alert:</span> {report_based.alert}</div>}
          {report_based.recommendation && report_based.recommendation.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Recommendation:</span> {report_based.recommendation}</div>}
        </div>
      )}
      {/* Death-priority section */}
      {death_priority && hasDeathPriority && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <div className="font-bold mb-1">Death Priority</div>
          {death_priority.status && death_priority.status.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Status:</span> {death_priority.status}</div>}
          {death_priority.alert && death_priority.alert.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Alert:</span> {death_priority.alert}</div>}
          {death_priority.recommendation && death_priority.recommendation.trim().toLowerCase() !== 'none' && <div><span className="font-bold">Recommendation:</span> {death_priority.recommendation}</div>}
        </div>
      )}
      {/* Last analysis time */}
      {last_analysis_time && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <span className="font-bold mb-1 text-base-content text-lg">Last Analyzed:</span> {new Date(last_analysis_time).toLocaleString()}
        </div>
      )}
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
