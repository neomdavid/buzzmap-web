import React, { useState } from 'react';
import { createPortal } from 'react-dom';

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

const RecommendationModal = ({
  barangayName,
  pattern_based,
  pattern_data,
  death_priority,
  aiRecommendations,
  recommendationLoading,
  showDetailedRecommendations,
  setShowDetailedRecommendations,
}) => {
  const borderColor = PATTERN_COLORS[getPatternKey(pattern_based?.status)]?.border || 'border-gray-400';
  const badgeBgClass = borderColor.replace('border-', 'bg-');
  const [preview, setPreview] = useState({ visible: false, uri: '', x: 0, y: 0, error: false });

  return (
    <>
    <dialog id={`recommendations_modal_${barangayName}`} className="modal">
      <div className={`modal-box bg-white rounded-4xl shadow-2xl w-11/12 max-w-5xl p-12 relative border-3 ${borderColor}`}>
        <button
          className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
          onClick={() => document.getElementById(`recommendations_modal_${barangayName}`).close()}
        >
          ✕
        </button>

        <p className="text-center text-3xl font-bold mb-6 text-primary">Recommendations</p>
        <p className="text-left text-2xl font-bold mb-6">
          For <span className={`text-white px-4 py-1 font-normal text-xl font-semibold ml-1 rounded-full ${badgeBgClass}`}>
            {barangayName}
          </span>
        </p>
        
        {/* Stats Badges in Modal */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {/* Pattern Badge */}
          {pattern_data?.pattern && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold ${badgeBgClass}`}>
              <span className="w-2 h-2 rounded-full bg-white/30"></span>
              {getPatternLabel(pattern_data.pattern)}
            </div>
          )}
          
          {/* Reports Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
            </svg>
            {pattern_data?.reports || 0} Reports
          </div>
          
          {/* Deaths/Fatality Badge */}
          {death_priority?.count > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-semibold">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              {death_priority.count} Fatality{death_priority.count === 1 ? '' : 'ies'}
            </div>
          )}
        </div>
        
        <hr className="text-accent/50 mb-6" />

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
              {/* Summary - Always visible */}
              {aiRecommendations[barangayName].summary && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-lg mb-2 text-gray-800">Summary</h4>
                  <p className="text-gray-700">{aiRecommendations[barangayName].summary}</p>
                </div>
              )}

              {/* View Detailed Recommendations Button */}
              {aiRecommendations[barangayName].recommendation && (
                <div className="text-center">
                  <button
                    onClick={() => setShowDetailedRecommendations(prev => !prev)}
                    className="btn btn-outline btn-primary"
                  >
                    {showDetailedRecommendations ? 'Hide Detailed Recommendations' : 'View Detailed Recommendations'}
                  </button>
                </div>
              )}

              {/* Detailed Content - Conditionally visible */}
              {showDetailedRecommendations && aiRecommendations[barangayName].recommendation && (
                <div className="space-y-4">
                  {/* Main Recommendation */}
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

                  {/* Sources as badges with hover preview (via fixed portal) */}
                  {aiRecommendations[barangayName].sources && aiRecommendations[barangayName].sources.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-lg mb-2 text-green-800">Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiRecommendations[barangayName].sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                            title={source.title}
                            onMouseEnter={(e) => {
                              const x = Math.min(e.clientX + 16, window.innerWidth - 380);
                              const y = Math.min(e.clientY + 16, window.innerHeight - 280);
                              setPreview({ visible: true, uri: source.uri, x, y, error: false });
                            }}
                            onMouseMove={(e) => {
                              const x = Math.min(e.clientX + 16, window.innerWidth - 380);
                              const y = Math.min(e.clientY + 16, window.innerHeight - 280);
                              setPreview(prev => ({ ...prev, x, y }));
                            }}
                            onMouseLeave={() => setPreview({ visible: false, uri: '', x: 0, y: 0, error: false })}
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
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
    {preview.visible && createPortal(
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
              onError={() => setPreview(prev => ({ ...prev, error: true }))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center text-sm text-gray-600 bg-gray-50">
              Preview not available for this site.
            </div>
          )}
        </div>
      </div>,
      (typeof window !== 'undefined' && document.getElementById(`recommendations_modal_${barangayName}`)) || document.body
    )}
    </>
  );
};

export default RecommendationModal;
