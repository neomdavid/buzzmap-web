import { useState, useMemo } from "react";
import { useGetBarangaysQuery, useGetPatternRecognitionResultsQuery, useGenerateRecommendationMutation } from "../../api/dengueApi";
import { MagnifyingGlass } from "phosphor-react";

export default function PatternAlerts({ selectedBarangay, selectedTab, onAlertSelect }) {
  const { data: barangaysData, isLoading, error } = useGetBarangaysQuery();
  const { data: patternResultsData, isLoading: patternResultsLoading } = useGetPatternRecognitionResultsQuery();
  const [generateRecommendation, { isLoading: isGeneratingRecommendation }] = useGenerateRecommendationMutation();
  
  // State for AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [recommendationLoading, setRecommendationLoading] = useState({});

  // Function to generate AI recommendation for a barangay
  const handleGenerateRecommendation = async (barangayName) => {
    if (aiRecommendations[barangayName]) {
      return; // Already generated
    }

    setRecommendationLoading(prev => ({ ...prev, [barangayName]: true }));
    
    try {
      const response = await generateRecommendation({
        userRole: "admin",
        barangay: barangayName
      }).unwrap();
      
      // The API returns the data directly, no need to check for success
      if (response && response.recommendation) {
        setAiRecommendations(prev => ({
          ...prev,
          [barangayName]: response
        }));
      }
    } catch (error) {
      console.error("Failed to generate recommendation:", error);
    } finally {
      setRecommendationLoading(prev => ({ ...prev, [barangayName]: false }));
    }
  };


  // Merge pattern data with barangay data (now only barangaysData)
  const patternData = useMemo(() => {
    if (!barangaysData) return [];
    
    const processedData = barangaysData.map(barangay => {
      const patternBased = barangay.status_and_recommendation?.pattern_based;
      const reportBased = barangay.status_and_recommendation?.report_based;
      const deathPriority = barangay.status_and_recommendation?.death_priority;
      
      // console.log('[PatternAlerts DEBUG] Processing barangay:', {
      //   name: barangay.name,
      //   patternBased,
      //   reportBased,
      //   deathPriority,
      //   pattern_data: barangay.pattern_data
      // });

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

    return processedData;
  }, [barangaysData]);

  // Filter alerts based on selected tab
  const filteredAlerts = useMemo(() => {
    if (!patternResultsData?.data) {
      return [];
    }

    // console.log('[PatternAlerts DEBUG] Filtering alerts with:', {
    //   selectedTab,
    //   selectedBarangay,
    //   patternResultsData: patternResultsData.data
    // });

    const filtered = patternResultsData.data.filter(item => {
      const pattern = item.pattern?.toLowerCase();
      
      let shouldInclude = false;
      switch (selectedTab) {
        case 'selected':
          shouldInclude = item.name.toLowerCase() === selectedBarangay?.toLowerCase();
          break;
        case 'all':
          shouldInclude = true;
          break;
        case 'spikes':
          shouldInclude = pattern === 'spike';
          break;
        case 'gradual':
          shouldInclude = pattern === 'gradual_rise';
          break;
        case 'stability':
          shouldInclude = pattern === 'stability';
          break;
        case 'decline':
          shouldInclude = pattern === 'decline';
          break;
        case 'no_pattern':
          shouldInclude = pattern === 'low_level_activity' || !pattern;
          break;
        default:
          shouldInclude = true;
      }
     
      return shouldInclude;
    });

    return filtered;
  }, [patternResultsData, selectedTab, selectedBarangay]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!patternResultsData?.data) {
    return (
      <div className="text-gray-500">No pattern data available.</div>
    );
  }


  return (
    <div className="flex flex-col gap-4 w-full px-4">
      {/* Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search barangay..."
          value={selectedBarangay || ''}
          onChange={(e) => onAlertSelect(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        />
        <MagnifyingGlass
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      {filteredAlerts.length === 0 ? (
        <div className="text-gray-500">No alerts found.</div>
      ) : (
        filteredAlerts.map(item => {
          // Find the corresponding barangay data
          const barangayData = barangaysData?.find(b => b.name === item.name);
          
          return (
            <AlertCard
              key={item.name}
              title={item.name}
              pattern_based={barangayData?.status_and_recommendation?.pattern_based}
              report_based={barangayData?.status_and_recommendation?.report_based}
              death_priority={barangayData?.status_and_recommendation?.death_priority}
              pattern_data={{
                pattern: item.pattern,
                alert: item.alert,
                recommendation: item.recommendation
              }}
              last_analysis_time={barangayData?.last_analysis_time}
              barangayName={item.name}
              onSelect={onAlertSelect}
              aiRecommendations={aiRecommendations}
              recommendationLoading={recommendationLoading}
              onGenerateRecommendation={handleGenerateRecommendation}
              isGeneratingRecommendation={isGeneratingRecommendation}
              setRecommendationLoading={setRecommendationLoading}
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
  low_level_activity: { border: 'border-gray-400', badge: 'bg-gray-400' },
  default: { border: 'border-gray-400', badge: 'bg-gray-400' }
};

const getPatternKey = (pattern) => {
  if (!pattern) return 'default';
  const p = pattern.trim().toLowerCase();
  if (p === 'spike') return 'spike';
  if (p === 'gradual_rise') return 'gradual_rise';
  if (p === 'stability') return 'stability';
  if (p === 'decline') return 'decline';
  if (p === 'low_level_activity') return 'low_level_activity';
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
  aiRecommendations,
  recommendationLoading,
  onGenerateRecommendation,
  isGeneratingRecommendation,
  setRecommendationLoading,
}) => {
  const hasContent = (obj, extraCheck = null) => {
    if (!obj) return false;
    if (extraCheck && !extraCheck(obj)) return false;
    return Object.values(obj).some(val => val !== null && val !== undefined && val !== '');
  };

  const getPatternBadgeColor = (pattern) => {
    if (!pattern) return 'border-gray-300';
    switch (pattern.toLowerCase()) {
      case 'spike':
        return 'border-error';
      case 'gradual_rise':
        return 'border-warning';
      case 'stability':
        return 'border-info';
      case 'decline':
        return 'border-success';
      case 'low_level_activity':
        return 'border-gray-300';
      default:
        return 'border-gray-300';
    }
  };

  const getPatternLabel = (pattern) => {
    if (!pattern) return 'No Pattern';
    switch (pattern.toLowerCase()) {
      case 'spike':
        return 'Spike';
      case 'gradual_rise':
        return 'Gradual Rise';
      case 'stability':
        return 'Stability';
      case 'decline':
        return 'Decline';
      case 'low_level_activity':
        return 'Low Level Activity';
      default:
        return 'No Pattern';
    }
  };

  const borderColor = getPatternBadgeColor(pattern_data?.pattern);
  const badgeBgClass = borderColor.replace('border-', 'bg-');

  return (
    <div className={`relative border-[2px] ${borderColor} rounded-4xl p-4 pt-10 text-black`}>
      <p className={`absolute text-lg left-[-2px] top-[-6px] text-nowrap ${badgeBgClass} rounded-2xl font-semibold text-white p-1 px-4`}>
        {title}
      </p>

      {/* Pattern display */}
      {pattern_data?.pattern && (
        <div className="mb-2">
          <span className="font-bold">Pattern:</span> {getPatternLabel(pattern_data.pattern)}
        </div>
      )}

      {/* Last analysis time */}
      {last_analysis_time && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <span className="font-bold mb-1 text-base-content text-lg">Last Analyzed:</span> {new Date(last_analysis_time).toLocaleString()}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={() => {
            // Set loading state immediately and open modal
            setRecommendationLoading(prev => ({ ...prev, [barangayName]: true }));
            document.getElementById(`recommendations_modal_${barangayName}`).showModal();
            
            // Generate AI recommendation if not already generated
            if (!aiRecommendations[barangayName]) {
              onGenerateRecommendation(barangayName);
            } else {
              // If already generated, just stop loading
              setRecommendationLoading(prev => ({ ...prev, [barangayName]: false }));
            }
          }}
          className="px-3 py-1.5 bg-white border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors text-sm cursor-pointer"
        >
          View Recommendations
        </button>
        <button 
          onClick={() => onSelect(title)}
          className="px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm cursor-pointer"
        >
          Select
        </button>
      </div>

      {/* Recommendations Modal */}
      <dialog id={`recommendations_modal_${barangayName}`} className="modal">
        <div className={`modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-5xl p-12 relative border-3 ${PATTERN_COLORS[getPatternKey(pattern_based.status)].border}`}>
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => document.getElementById(`recommendations_modal_${barangayName}`).close()}
          >
            ✕
          </button>

          <p className="text-center text-3xl font-bold mb-6 text-primary">Recommendations</p>
          <p className="text-left text-2xl font-bold mb-6">For <span className={`text-white px-4 py-1 font-normal text-xl font-semibold ml-1 rounded-full ${PATTERN_COLORS[getPatternKey(pattern_based.status)].badge}`}>{barangayName}</span></p>
          <hr className="text-accent/50 mb-6" />

          {/* Pattern and Alert Section
          <div className="mb-4">
            <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${getPatternBadgeColor(pattern_based.status)}`}>
              {getPatternLabel(pattern_based.status)}
            </span>
      
            {pattern_based.alert && (
              <div className="bg-base-200 p-4 rounded-lg">
                <span className="font-semibold">Alert:</span> {pattern_based.alert}
              </div>
            )}
          </div> */}

          {/* Death Priority Section */}
          {/* {death_priority && death_priority.count > 0 && (
            <div className="mb-6  p-4 rounded-lg text-lg border border-error">
              <p 
                className="text-error mb-3"
                dangerouslySetInnerHTML={{
                  __html: death_priority.alert.replace(
                    `${death_priority.count} death(s)`,
                    `<span class="bg-error text-white px-2 py-0.5 rounded-full text-sm font-semibold mx-1">${death_priority.count} ${death_priority.count === 1 ? 'death' : 'deaths'}</span>`
                  )
                }}
              />
              {death_priority.recommendation && (
                <div className="mt-3 pt-3 border-t border-error/20">
                  <p className="text-error/90">
                    <span className="font-semibold">Recommendation:</span> {death_priority.recommendation}
                  </p>
                </div>
              )}
            </div>
          )} */}

          <div className="max-h-[60vh] overflow-y-auto">
            {/* AI Recommendations Section */}
            <p className="text-xl font-semibold mb-4 text-primary">AI-Powered Recommendations</p>
            
            {recommendationLoading[barangayName] && (
              <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg text-primary mr-3"></span>
                <span className="text-gray-600 text-lg">Generating AI recommendations...</span>
              </div>
            )}

            {aiRecommendations[barangayName] && !recommendationLoading[barangayName] && (
              <div className="space-y-4">
                {/* Summary */}
                {aiRecommendations[barangayName].summary && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-lg mb-2 text-gray-800">Summary</h4>
                    <p className="text-gray-700">{aiRecommendations[barangayName].summary}</p>
                  </div>
                )}

                {/* Main Recommendation */}
                {aiRecommendations[barangayName].recommendation && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-lg mb-2 text-gray-800">Detailed Recommendations</h4>
                    <div 
                      className="text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: aiRecommendations[barangayName].recommendation
                          .replace(/\n/g, '<br>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                  </div>
                )}

                {/* Key Factors */}
                {aiRecommendations[barangayName].factors && aiRecommendations[barangayName].factors.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-lg mb-2 text-yellow-800">Key Factors Considered</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {aiRecommendations[barangayName].factors.map((factor, index) => (
                        <li key={index} className="text-yellow-700">{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sources */}
                {aiRecommendations[barangayName].sources && aiRecommendations[barangayName].sources.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-lg mb-2 text-green-800">Sources</h4>
                    <ul className="space-y-1">
                      {aiRecommendations[barangayName].sources.map((source, index) => (
                        <li key={index} className="text-green-700">
                          <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!aiRecommendations[barangayName] && !recommendationLoading[barangayName] && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No AI recommendations available.</p>
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
    </div>
  );
};
