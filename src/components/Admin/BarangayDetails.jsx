import React, { useState, useMemo } from "react";
import {
  MapPinLine,
  CheckCircle,
  Circle,
  Clock,
  MagnifyingGlass,
} from "phosphor-react";

const BarangayDetails = ({
  selectedBarangay,
  getBorderColor,
  getPatternTextColor,
  reportsWithinBarangay,
  reportsWithinBarangayLoading,
  activeInterventions,
  recentDengueCases,
  getPatternBgColor,
  barangaysList,
  interventionsData,
  handleViewFullReport,
  handleShowOnMap,
  BREEDING_SITE_TYPE_ICONS,
}) => {
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // Filter reports based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reportsWithinBarangay || [];

    const query = searchQuery.toLowerCase();
    return (reportsWithinBarangay || []).filter((report) => {
      return (
        report.description?.toLowerCase().includes(query) ||
        report.report_type?.toLowerCase().includes(query) ||
        report.barangay?.toLowerCase().includes(query) ||
        new Date(report.date_and_time)
          .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase()
          .includes(query)
      );
    });
  }, [reportsWithinBarangay, searchQuery]);
  // Don't render anything if no barangay is selected
  if (!selectedBarangay) {
    return (
      <p className="text-left text-primary text-lg font-extrabold flex items-center gap-2 mb-8">
        <div className="text-success">
          <MapPinLine size={16} />
        </div>
        Click on a Barangay to view details
      </p>
    );
  }

  return (
    <>
      <div className="h-auto grid grid-cols-10 gap-10">
        <div
          className={`col-span-4 border-2 ${getBorderColor(
            selectedBarangay?.properties?.patternType
          )} rounded-2xl flex flex-col p-4 gap-1`}
        >
          <p className="text-center font-semibold text-base-content">
            Selected Barangay - Dengue Overview
          </p>
          <p
            className={`text-center font-bold ${getPatternTextColor(
              selectedBarangay?.properties?.patternType
            )} text-4xl mb-4 mt-2`}
          >
            {selectedBarangay
              ? `Barangay ${
                  selectedBarangay.properties?.displayName ||
                  selectedBarangay.properties?.name
                }`
              : "Select a Barangay"}
          </p>
          <p
            className={`text-center font-semibold text-neutral-content text-lg uppercase mb-4 px-4 py-1 rounded-full inline-block mx-auto ${getPatternBgColor(
              selectedBarangay?.properties?.patternType
            )}`}
          >
            {selectedBarangay
              ? selectedBarangay.properties?.patternType
                ? selectedBarangay.properties.patternType
                    .charAt(0)
                    .toUpperCase() +
                  selectedBarangay.properties.patternType
                    .slice(1)
                    .replace(/_/g, " ")
                : "NO PATTERN DETECTED"
              : "NO BARANGAY SELECTED"}
          </p>
          <div className="w-[90%] mx-auto flex flex-col text-black gap-2">
            {/* Pattern-Based */}
            {selectedBarangay?.status_and_recommendation?.pattern_based &&
              selectedBarangay.status_and_recommendation.pattern_based.status &&
              selectedBarangay.status_and_recommendation.pattern_based.status.trim() !==
                "" && (
                <>
                  <p className="font-bold text-lg text-primary mb-1">
                    Pattern-Based
                  </p>
                  {selectedBarangay.status_and_recommendation.pattern_based
                    .alert && (
                    <p className="">
                      <span className="font-bold">Alert: </span>
                      {selectedBarangay.status_and_recommendation.pattern_based.alert.replace(
                        new RegExp(
                          `^${
                            selectedBarangay.properties?.displayName ||
                            selectedBarangay.properties?.name
                          }:?\\s*`,
                          "i"
                        ),
                        ""
                      )}
                    </p>
                  )}
                  {selectedBarangay.status_and_recommendation.pattern_based
                    .recommendation && (
                    <p className="">
                      <span className="font-bold">Recommendation: </span>
                      {
                        selectedBarangay.status_and_recommendation.pattern_based
                          .recommendation
                      }
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
              )}
            {/* Report-Based */}
            {selectedBarangay?.status_and_recommendation?.report_based &&
              selectedBarangay.status_and_recommendation.report_based.status &&
              selectedBarangay.status_and_recommendation.report_based.status.trim() !==
                "" && (
                <>
                  <p className="font-bold text-lg text-primary mb-1">
                    Report-Based
                  </p>
                  {/* Status as badge with label */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold">Status:</span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-md font-bold capitalize ${(() => {
                        const status =
                          selectedBarangay.status_and_recommendation.report_based.status.toLowerCase();
                        if (status === "low") return "bg-success";
                        if (status === "medium") return "bg-warning";
                        if (status === "high") return "bg-error";
                        return "bg-gray-400";
                      })()}`}
                    >
                      {
                        selectedBarangay.status_and_recommendation.report_based
                          .status
                      }
                    </span>
                  </div>
                  {selectedBarangay.status_and_recommendation.report_based
                    .alert && (
                    <p className="">
                      <span className="font-bold">Alert: </span>
                      {
                        selectedBarangay.status_and_recommendation.report_based
                          .alert
                      }
                    </p>
                  )}
                  {selectedBarangay.status_and_recommendation.report_based
                    .recommendation && (
                    <p className="">
                      <span className="font-bold">Recommendation: </span>
                      {
                        selectedBarangay.status_and_recommendation.report_based
                          .recommendation
                      }
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
              )}
            {/* Death Priority */}
            {selectedBarangay?.status_and_recommendation?.death_priority &&
              selectedBarangay.status_and_recommendation.death_priority
                .status &&
              selectedBarangay.status_and_recommendation.death_priority.status.trim() !==
                "" && (
                <>
                  <p className="font-bold text-primary mb-1 text-lg">
                    Death Priority
                  </p>
                  <p className="">
                    <span className="font-bold">Status: </span>
                    {
                      selectedBarangay.status_and_recommendation.death_priority
                        .status
                    }
                  </p>
                  {selectedBarangay.status_and_recommendation.death_priority
                    .alert && (
                    <p className="">
                      <span className="font-bold">Alert: </span>
                      {
                        selectedBarangay.status_and_recommendation
                          .death_priority.alert
                      }
                    </p>
                  )}
                  {selectedBarangay.status_and_recommendation.death_priority
                    .recommendation && (
                    <p className="">
                      <span className="font-bold">Recommendation: </span>
                      {
                        selectedBarangay.status_and_recommendation
                          .death_priority.recommendation
                      }
                    </p>
                  )}
                  <hr className="border-t border-gray-200 my-2" />
                </>
              )}
            {/* Pattern Based Alert */}
            {barangaysList?.find(
              (b) => b.name === selectedBarangay?.properties?.name
            )?.status_and_recommendation?.pattern_based?.alert && (
              <div>
                <p className="text-md text-center text-gray-700 font-normal">
                  {
                    barangaysList.find(
                      (b) => b.name === selectedBarangay?.properties?.name
                    )?.status_and_recommendation?.pattern_based?.alert
                  }
                </p>
              </div>
            )}
            {/* Recent Dengue Cases */}
            {recentDengueCases && Object.keys(recentDengueCases).length > 0 && (
              <div className="mb-2">
                <p className="mt-1">
                  <span className="font-bold text-lg">
                    Recent Dengue Cases:{" "}
                  </span>
                </p>
                <div className="mt-3 flex flex-col space-y-3 ml-4">
                  {/* Dengue Cases List */}
                  {Object.entries(recentDengueCases).map(([date, count]) => (
                    <div key={date} className="flex gap-2 items-center">
                      <div>
                        <Circle size={16} color="red" weight="fill" />
                      </div>
                      <p className="font-bold">
                        {date}:{" "}
                        <span className="font-normal">
                          {count} case{count > 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
                <hr className="border-t border-gray-200 my-2" />
              </div>
            )}
            {/* Interventions Section */}
            {interventionsData && interventionsData.length > 0 && (
              <>
                {/* Ongoing Interventions */}
                {interventionsData.filter((i) => i.status === "Ongoing")
                  .length > 0 && (
                  <>
                    <p className="font-bold text-lg text-primary mb-1">
                      Ongoing Interventions:
                    </p>
                    <div className="flex flex-col space-y-2 ml-4">
                      {interventionsData
                        .filter((i) => i.status === "Ongoing")
                        .map((intervention) => (
                          <div
                            key={intervention._id}
                            className="flex text-md gap-2 items-center"
                          >
                            <div className="text-success">
                              <CheckCircle size={16} />
                            </div>
                            <p className="font-bold">
                              {new Date(intervention.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                              :{" "}
                              <span className="font-normal">
                                {intervention.interventionType}
                              </span>
                            </p>
                          </div>
                        ))}
                    </div>
                    <hr className="border-t border-gray-200 my-2" />
                  </>
                )}

                {/* Scheduled Interventions */}
                {interventionsData.filter((i) => i.status === "Scheduled")
                  .length > 0 && (
                  <>
                    <p className="font-bold text-lg text-primary mb-1">
                      Scheduled Interventions:
                    </p>
                    <div className="flex flex-col space-y-2 ml-4">
                      {interventionsData
                        .filter((i) => i.status === "Scheduled")
                        .map((intervention) => (
                          <div
                            key={intervention._id}
                            className="flex text-md gap-2 items-center"
                          >
                            <div className="text-warning">
                              <Clock size={16} />
                            </div>
                            <p className="font-bold">
                              {new Date(intervention.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                              :{" "}
                              <span className="font-normal">
                                {intervention.interventionType}
                              </span>
                            </p>
                          </div>
                        ))}
                    </div>
                    <hr className="border-t border-gray-200 my-2" />
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end">
            {/* <button className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer">
              View Full Report
            </button> */}
          </div>
        </div>
        <div className="col-span-6 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[30px] text-base-content font-bold flex items-center">
              Reports within barangay
              <span className="ml-3 inline-flex items-center justify-center rounded-full bg-primary text-white text-sm font-semibold px-3 py-0.5">
                {filteredReports?.length || 0}
              </span>
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reports by description, type, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
          {reportsWithinBarangayLoading ? (
            <div className="flex flex-col items-start bg-white rounded-2xl p-4 text-black gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              <p className="text-gray-600">Loading reports…</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredReports.map((report, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start bg-white rounded-2xl p-4 text-black gap-2 w-full"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={
                        BREEDING_SITE_TYPE_ICONS[report.report_type] ||
                        BREEDING_SITE_TYPE_ICONS.default
                      }
                      alt={report.report_type}
                      className="w-8 h-8"
                    />
                    <p className="font-semibold text-lg">
                      {report.barangay} - {report.report_type}
                    </p>
                  </div>
                  {Array.isArray(report?.specific_location?.coordinates) && (
                    <p>
                      <span className="font-bold ml-1.5">Coordinates: </span>
                      {report.specific_location.coordinates[1].toFixed(6)},{" "}
                      {report.specific_location.coordinates[0].toFixed(6)}
                    </p>
                  )}
                  <p>
                    <span className="font-bold ml-1.5">Reported: </span>
                    {new Date(report.date_and_time).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <p>
                    <span className="font-bold ml-1.5">Description: </span>
                    {report.description}
                  </p>
                  <div className="flex justify-end w-full gap-2">
                    <button
                      onClick={() => handleViewFullReport(report)}
                      className="bg-white text-primary border-1 rounded-full  px-4 py-1 text-[11px] hover:cursor-pointer hover:bg-primary/30 transition-all duration-200"
                    >
                      View Full Report
                    </button>
                    <button
                      onClick={() => handleShowOnMap(report, "report")}
                      className="bg-primary rounded-full text-white px-4 py-1 text-[11px] hover:bg-primary/80 hover:scale-105 transition-all duration-200 active:scale-95 cursor-pointer"
                    >
                      Show on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start bg-white rounded-2xl p-4 text-black gap-2">
              <p className="text-gray-500 italic">
                {searchQuery
                  ? `No reports found matching "${searchQuery}"`
                  : "No reports found"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:text-primary/80 text-sm underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BarangayDetails;
