import React, { useState, useRef, useEffect } from "react";
import { CaretRight } from "phosphor-react";
import cleanUpIcon from "../../assets/icons/cleanup.svg";
import foggingIcon from "../../assets/icons/fogging.svg";
import educationIcon from "../../assets/icons/education.svg";
import trappingIcon from "../../assets/icons/trapping.svg";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import garbageIcon from "../../assets/icons/garbage.svg";
import othersIcon from "../../assets/icons/others.svg";
import allIcon from "../../assets/all.svg";
import { IconInfoCircle } from "@tabler/icons-react";

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
  barangayDataLoading,
  selectedIntervention,
  setSelectedIntervention,
}) => {
  const [showBreedingInfo, setShowBreedingInfo] = useState(false);
  const breedingInfoRef = useRef(null);

  useEffect(() => {
    if (showBreedingInfo && breedingInfoRef.current) {
      breedingInfoRef.current.showModal?.();
    }
  }, [showBreedingInfo]);
  return (
    <div className="absolute top-6 left-0 md:left-10 z-10 w-full md:w-auto flex justify-center md:block">
      {showControlPanel && (
        <div className="relative bg-white/85  rounded-lg shadow-xl p-6 w-[90vw] sm:w-[70vw] md:w-[400px] text-primary transition-all duration-300 ease-in-out transform">
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
              <option value="">Choose a barangay</option>
              {(() => {
                // Show loading state if data is still loading
                if (barangayDataLoading) {
                  return (
                    <option value="" disabled>
                      Loading barangays...
                    </option>
                  );
                }

                if (!barangayData?.features) {
                  return (
                    <option value="" disabled>
                      No barangay data available
                    </option>
                  );
                }

                if (barangayData.features.length === 0) {
                  return (
                    <option value="" disabled>
                      No barangays found
                    </option>
                  );
                }

                // Filter out features without names first
                const featuresWithNames = barangayData.features.filter(
                  (feature) => {
                    // Check if the feature has a valid name
                    const name = feature.properties?.name;
                    return (
                      name && typeof name === "string" && name.trim() !== ""
                    );
                  }
                );

                // If no features with names, show loading
                if (featuresWithNames.length === 0) {
                  return (
                    <option value="" disabled>
                      Loading barangays...
                    </option>
                  );
                }

                return featuresWithNames
                  .slice()
                  .sort((a, b) => {
                    const nameA = a.properties?.name || "";
                    const nameB = b.properties?.name || "";
                    return nameA.localeCompare(nameB);
                  })
                  .map((feature, index) => {
                    const name = feature.properties?.name;
                    return (
                      <option
                        key={`barangay-${name}-${index}`}
                        value={name || ""}
                      >
                        {name}
                      </option>
                    );
                  });
              })()}
            </select>

            {/* Legends */}
            <div className="flex flex-col gap-3">
              {/* Barangay Color Legend */}
              <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Barangay Status Colors
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border-2"
                      style={{
                        backgroundColor: "#ea580c",
                        borderColor: "#ea580c",
                      }}
                    ></div>
                    <span className="text-xs text-primary">
                      Increasing Cases
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border-2"
                      style={{
                        backgroundColor: "#38a169",
                        borderColor: "#38a169",
                      }}
                    ></div>
                    <span className="text-xs text-primary">
                      Decreasing Cases
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border-2"
                      style={{
                        backgroundColor: "#718096",
                        borderColor: "#718096",
                      }}
                    ></div>
                    <span className="text-xs text-primary">
                      No Change/Stable
                    </span>
                  </div>
                </div>
              </div>

              {/* Marker Legend */}
              {(showBreedingSites || showInterventions) && (
                <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                  <div className="space-y-2">
                    {showBreedingSites && (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-600">
                            Breeding Site Types
                          </p>
                          <button
                            type="button"
                            className="text-gray-500 hover:text-primary"
                            aria-label="What do these types mean?"
                            onClick={() => setShowBreedingInfo(true)}
                          >
                            <IconInfoCircle size={16} />
                          </button>
                        </div>
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
                            key="all-intervention"
                            className="flex items-center space-x-2"
                          >
                            <img src={allIcon} alt="All" className="w-6 h-6" />
                            <span className="text-xs text-primary">
                              All Interventions
                            </span>
                          </div>
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
      {showBreedingInfo && (
        <dialog
          ref={breedingInfoRef}
          className="modal"
          onClick={(e) =>
            e.target === e.currentTarget && setShowBreedingInfo(false)
          }
        >
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-11/12 max-w-xl p-8 relative text-primary">
            <button
              className="absolute top-3 right-4 text-xl hover:text-gray-600 hover:cursor-pointer"
              onClick={() => setShowBreedingInfo(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <p className="text-2xl font-extrabold mb-6 tracking-wide">
              Report Type Meanings
            </p>
            <div className="flex flex-col gap-6 text-md leading-snug">
              <div className="flex items-start gap-3">
                <img
                  src={stagnantIcon}
                  alt="Stagnant Water"
                  className="w-8 h-8 rounded"
                />
                <p>
                  <span className="font-semibold">Stagnant Water:</span> Any
                  pooled or unmoving water that can breed mosquitoes (e.g.,
                  puddles, containers, gutters).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <img
                  src={garbageIcon}
                  alt="Uncollected Garbage or Trash"
                  className="w-8 h-8 rounded"
                />
                <p>
                  <span className="font-semibold">
                    Uncollected Garbage or Trash:
                  </span>{" "}
                  Piles of garbage or litter that can collect water and attract
                  mosquitoes.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <img
                  src={othersIcon}
                  alt="Others"
                  className="w-8 h-8 rounded"
                />
                <p>
                  <span className="font-semibold">Others:</span> Any
                  dengue-related concern not listed above (e.g., suspected
                  breeding areas, related hazards).
                </p>
              </div>
            </div>
          </div>
        </dialog>
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
