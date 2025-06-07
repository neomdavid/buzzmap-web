import React from "react";
import { Circle, MagnifyingGlass, Lightbulb, Warning, CheckCircle } from "phosphor-react";
import { useGetAllInterventionsQuery } from "../../api/dengueApi";
import { CheckCircle as LucideCheckCircle } from 'lucide-react';

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
  // Get all interventions
  const { data: allInterventions } = useGetAllInterventionsQuery();
  
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

    const daysFromToday = Math.floor((interventionDate - today) / (1000 * 60 * 60 * 24));
    const isWithin = daysFromToday >= -14 && daysFromToday <= 14;

    console.log('[DEBUG] Date validation for', dateStr, ':');
    console.log('- Today:', today.toISOString());
    console.log('- Intervention date:', interventionDate.toISOString());
    console.log('- Days from today:', daysFromToday);
    console.log('- Two weeks ago:', twoWeeksAgo.toISOString());
    console.log('- Two weeks ahead:', twoWeeksAhead.toISOString());
    console.log('- Is within two weeks:', isWithin);

    return isWithin;
  };

  // Get all interventions for this barangay
  const barangayInterventions = allInterventions?.filter(i => i.barangay === barangay) || [];
  
  // Debug each intervention's date validation
  console.log(`[DEBUG] Checking interventions for ${barangay}:`);
  barangayInterventions.forEach(i => {
    console.log(`\nValidating intervention from ${i.date}:`);
    const isValid = isWithinTwoWeeks(i.date);
    console.log(`- Is within 2 weeks: ${isValid}`);
  });
  
  // Filter to only include interventions within the 2-week window
  const recentInterventions = barangayInterventions.filter(i => {
    const isValid = isWithinTwoWeeks(i.date);
    console.log(`[DEBUG] Filtering intervention from ${i.date}: ${isValid ? 'INCLUDED' : 'EXCLUDED'}`);
    return isValid;
  });

  console.log(`[DEBUG] Summary for ${barangay}:`);
  console.log('- Total interventions:', barangayInterventions.length);
  console.log('- Recent interventions (within 2 weeks):', recentInterventions.length);
  console.log('- Recent intervention dates:', recentInterventions.map(i => i.date));

  const hasRecentIntervention = recentInterventions.length > 0;
  const latestRecentIntervention = hasRecentIntervention 
    ? recentInterventions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;

  console.log(`[DEBUG] Final status for ${barangay}:`);
  console.log('- Has recent intervention:', hasRecentIntervention);
  console.log('- Latest recent intervention:', latestRecentIntervention?.date);
  console.log('- Latest status:', latestRecentIntervention?.status);

  // Show Apply button if there are no recent interventions
  const showApplyButton = !hasRecentIntervention;

  console.log(`[DEBUG] Button state for ${barangay}:`);
  console.log('- Show Apply button:', showApplyButton);
  console.log('- Reason:', hasRecentIntervention ? 'Has recent intervention' : 'No recent interventions');

  // Determine colors and urgency based on pattern type
  const patternType = pattern_based?.status || "none";
  const styles = PATTERN_STYLES[patternType?.toLowerCase()] || PATTERN_STYLES.none;
  const urgencyLevelToDisplay = styles.urgency;

  // Status badge styles
  const statusStyles = {
    Scheduled: "bg-info/10 text-info border-info/20",
    Ongoing: "bg-warning/10 text-warning border-warning/20",
    Complete: "bg-success/10 text-success border-success/20"
  };

  return (
    <div className={`flex flex-col gap-4 border-2 ${styles.border} rounded-3xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <p className={`${styles.text} font-extrabold text-2xl`}>{barangay}</p>
          {!hideSharedInfo && (
            <p className={`${styles.bg} text-center text-white py-1 px-4 rounded-xl text-sm`}>
              {urgencyLevelToDisplay}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(pattern_based?.admin_recommendation || report_based?.admin_recommendation || death_priority?.recommendation) && (
            <button
              onClick={() => document.getElementById(`recommendations_modal_${barangay}`).showModal()}
              className="px-3 py-1.5 bg-white border border-primary text-primary rounded-full hover:bg-primary/5 transition-colors text-sm cursor-pointer"
            >
              View Recommendations
            </button>
          )}
          {hasRecentIntervention ? (
            <div className={`px-3 py-1.5 rounded-full border text-sm flex items-center gap-1.5 ${statusStyles[latestRecentIntervention.status]}`}>
              <LucideCheckCircle size={16} weight="fill" />
              {latestRecentIntervention.status}
            </div>
          ) : onApply && ['spike', 'gradual_rise'].includes(patternType?.toLowerCase()) && showApplyButton && (
            <button 
              onClick={() => onApply(barangay, pattern_based?.status)}
              className="px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm cursor-pointer"
            >
              Apply
            </button>
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
              <p className="text-black">
                {pattern_based.alert}
              </p>
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
          {report_based.alert && report_based.alert !== 'None' && (
            <div className="flex items-start gap-3 ml-6">
              <p className="text-black">
                {report_based.alert}
              </p>
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
           death_priority.alert.trim() !== '' && 
           !death_priority.alert.toLowerCase().includes('no deaths') && (
            <div className="flex items-start gap-3 ml-6">
              <p className="text-error">
                {death_priority.alert}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Modal */}
      <dialog id={`recommendations_modal_${barangay}`} className="modal">
        <div className={`modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-5xl p-12 relative border-3 ${PATTERN_COLORS[getPatternKey(pattern_based?.status)].border}`}>
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => document.getElementById(`recommendations_modal_${barangay}`).close()}
          >
            ✕
          </button>

          <p className="text-center text-3xl font-bold mb-6 text-primary">Recommendations</p>
          <p className="text-left text-2xl font-bold mb-6">For <span className={`text-white px-4 py-1 font-normal text-xl font-semibold ml-1 rounded-full ${PATTERN_COLORS[getPatternKey(pattern_based?.status)].badge}`}>{barangay}</span></p>
          <hr className="text-accent/50 mb-[-2px]" />

          {/* Pattern and Alert Section */}
          <div className="mb-4">
            <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${getPatternBadgeColor(pattern_based?.status)}`}>
              {getPatternLabel(pattern_based?.status)}
            </span>
            
            {pattern_based?.alert && (
              <div className="bg-base-200 p-4 rounded-lg">
                {pattern_based.alert}
              </div>
            )}
          </div>

          {/* Report-based Section */}
          {report_based && (
            <div className="mb-6 p-4 rounded-lg text-lg border border-warning">
              <div className="font-bold mb-2 text-base-content text-lg">Report-Based</div>
              {typeof report_based.count === 'number' && report_based.count > 0 && (
                <div className="mb-2">
                  <span className="font-bold">Reports:</span> {report_based.count}
                </div>
              )}
              {report_based.alert && report_based.alert !== 'None' && (
                <div className="mb-2">
                  {report_based.alert}
                </div>
              )}
            </div>
          )}

          {/* Death Priority Section */}
          {death_priority && death_priority.count > 0 && (
            <div className="mb-6 p-4 rounded-lg text-lg border border-error">
              <div className="font-bold mb-2 text-base-content text-lg">Death-Based</div>
              <p 
                className="text-error mb-3"
                dangerouslySetInnerHTML={{
                  __html: death_priority.alert.replace(
                    `${death_priority.count} death(s)`,
                    `<span class="bg-error text-white px-2 py-0.5 rounded-full text-sm font-semibold mx-1">${death_priority.count} ${death_priority.count === 1 ? 'death' : 'deaths'}</span>`
                  )
                }}
              />
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            <p className="text-xl font-semibold mb-4">Pattern-Based Recommendations:</p>
            <ul className="list-disc list-inside space-y-4">
              {pattern_based?.admin_recommendation ? (
                pattern_based.admin_recommendation.split('\n')
                  .filter(rec => rec.trim())
                  .map((rec, index) => (
                    <li key={index} className="text-gray-700 text-lg">
                      {rec.trim().replace(/^- /, '')}
                    </li>
                  ))
              ) : (
                <li className="text-gray-700 text-lg">No recommendations available.</li>
              )}
            </ul>
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

export default ActionRecommendationCard;
