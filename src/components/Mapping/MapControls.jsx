import React from "react";
import { CaretRight } from "phosphor-react";
import cleanUpIcon from "../../assets/icons/cleanup.svg";
import foggingIcon from "../../assets/icons/fogging.svg";
import educationIcon from "../../assets/icons/education.svg";
import trappingIcon from "../../assets/icons/trapping.svg";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import garbageIcon from "../../assets/icons/garbage.svg";
import othersIcon from "../../assets/icons/others.svg";

const MapControls = ({
  showControlPanel,
  setShowControlPanel,
  showBreedingSites,
  setShowBreedingSites,
  showInterventions,
  setShowInterventions,
  selectedBarangay,
  handleBarangaySelect,
  barangayData,
  selectedIntervention,
  setSelectedIntervention,
}) => {
  return (
    <div className="absolute top-6 left-0 md:left-10 z-10 w-full md:w-auto flex justify-center md:block">
      {showControlPanel && (
        <div className="relative bg-white/60 backdrop-blur-md rounded-lg shadow-xl p-6 w-[90vw] sm:w-[70vw] md:w-[400px] text-primary transition-all duration-300 ease-in-out transform">
          <button
            onClick={() => setShowControlPanel(false)}
            className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-gray-200 text-primary rounded-full w-8 h-8 flex items-center justify-center shadow"
            aria-label="Close panel"
          >
            <span className="text-2xl font-bold">&times;</span>
          </button>
          <p className="text-3xl font-extrabold text-primary mb-2">
            Check your place
          </p>
          <p className="text-sm text-primary mb-4">
            Stay Protected. Look out for Dengue Outbreaks.
          </p>

          {/* Controls */}
          <div className="flex flex-col gap-3">
            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowBreedingSites(!showBreedingSites)}
                className={`w-full px-4 py-2 hover:cursor-pointer rounded-md shadow transition-colors ${
                  showBreedingSites
                    ? "bg-primary text-white"
                    : "bg-white text-primary hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {showBreedingSites
                  ? "Hide Breeding Sites"
                  : "Show Breeding Sites"}
              </button>
              <button
                onClick={() => {
                  setShowInterventions(!showInterventions);
                  if (showInterventions) setSelectedIntervention(null);
                }}
                className={`w-full hover:cursor-pointer py-2 rounded-md shadow transition-colors ${
                  showInterventions
                    ? "bg-primary text-white"
                    : "bg-white text-primary hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {showInterventions
                  ? "Hide Interventions"
                  : "Show Interventions"}
              </button>
            </div>

            {/* Barangay Select */}
            <select
              value={selectedBarangay}
              onChange={handleBarangaySelect}
              className="w-full px-4 py-2 hover:cursor-pointer rounded-md shadow bg-transparent text-primary border border-primary/20 focus:border-primary focus:outline-none"
            >
              <option value="">Select a barangay</option>
              {barangayData?.features?.map((feature, index) => (
                <option
                  key={`barangay-${feature.properties.name || index}`}
                  value={feature.properties.name || ""}
                >
                  {feature.properties.name || `Unknown Barangay ${index + 1}`}
                </option>
              ))}
            </select>

            {/* Legends */}
            <div className="flex flex-col gap-3">
              {/* Marker Legend */}
              {(showBreedingSites || showInterventions) && (
                <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                  <div className="space-y-2">
                    {showBreedingSites && (
                      <>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Breeding Site Types
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div
                            key="stagnant-water"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={stagnantIcon}
                              alt="Stagnant Water"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">
                              Stagnant Water
                            </span>
                          </div>

                          <div
                            key="garbage-trash"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={garbageIcon}
                              alt="Uncollected Garbage or Trash"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">
                              Uncollected Garbage or Trash
                            </span>
                          </div>
                          <div
                            key="others-type"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={othersIcon}
                              alt="Others"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">Others</span>
                          </div>
                        </div>
                      </>
                    )}
                    {showInterventions && (
                      <>
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Intervention Types
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div
                            key="fogging-intervention"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={foggingIcon}
                              alt="Fogging"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">
                              Fogging
                            </span>
                          </div>
                          <div
                            key="trapping-intervention"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={trappingIcon}
                              alt="Ovicidal-Larvicidal Trapping"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">
                              Ovicidal-Larvicidal Trapping
                            </span>
                          </div>
                          <div
                            key="cleanup-intervention"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={cleanUpIcon}
                              alt="Clean-up Drive"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">
                              Clean-up Drive
                            </span>
                          </div>
                          <div
                            key="education-intervention"
                            className="flex items-center space-x-2"
                          >
                            <img
                              src={educationIcon}
                              alt="Education Campaign"
                              className="w-6 h-6"
                            />
                            <span className="text-xs text-primary">
                              Education Campaign
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {!showControlPanel && (
        <button
          onClick={() => setShowControlPanel(true)}
          className="fixed top-30 left-4 z-50 hover:cursor-pointer bg-white/90 hover:bg-gray-200 text-primary rounded-full p-2 shadow-lg border border-primary"
          aria-label="Show panel"
        >
          <CaretRight size={28} weight="bold" />
        </button>
      )}
    </div>
  );
};

export default MapControls;
