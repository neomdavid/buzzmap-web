import React from 'react';
import GradientText from '../../../Reactbits/GradientText/GradientText.jsx';
import { Sparkle } from 'phosphor-react';

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

      {/* Stats badges removed from card. Shown in modal only. */}

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
          className={`px-4 py-2 rounded-full text-sm font-semibold  flex gap-2 border border-primary/80  transition-all hover:border-primary hover:border-1.5 duration-300`}
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
