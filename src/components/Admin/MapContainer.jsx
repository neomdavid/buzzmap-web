import React from "react";
import MapOnly from "../Mapping/MapOnly";

const MapContainer = ({
  mapContainerRef,
  mapOnlyRef,
  showBreedingSites,
  showInterventions,
  selectedBarangay,
  handleBarangaySelect,
  activeInterventions,
  setSelectedFullReport,
  setShowFullReport,
  clusters = [],
}) => {
  return (
    <div className="flex h-[50vh] mb-4" ref={mapContainerRef}>
      <MapOnly
        ref={mapOnlyRef}
        showBreedingSites={showBreedingSites}
        showInterventions={showInterventions}
        selectedBarangay={selectedBarangay}
        onBarangaySelect={handleBarangaySelect}
        interventions={showInterventions ? activeInterventions : []}
        clusters={clusters}
        style={{ height: "100%", width: "100%" }}
        useAdminEndpoint={true}
        onMarkerClick={(item, type) => {
          if (type === "report") {
            setSelectedFullReport(item);
            setShowFullReport(true);
          } else if (type === "intervention") {
            // Create and show info window for intervention
            const content = document.createElement("div");
            content.innerHTML = `
              <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white text-center rounded-md shadow-md text-primary">
                <p class="text-4xl font-extrabold text-primary mb-2">${
                  item.interventionType || "Intervention"
                }</p>
                <div class="text-lg flex items-center gap-2">
                  <span class="font-bold">Status:</span>
                  <span class="px-3 py-1 rounded-full text-white font-bold text-sm" style="background-color:#FF6347;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                    ${item.status || ""}
                  </span>
                </div>
                <p class="text-lg text-center"><span class="font-bold">Barangay:</span> ${
                  item.barangay || ""
                }</p>
                ${
                  item.address
                    ? `<p class="text-lg text-center"><span class="font-bold text-center">Address:</span> ${item.address}</p>`
                    : ""
                }
                <p class="text-lg"><span class="font-bold">Date:</span> ${
                  item.date
                    ? new Date(item.date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : ""
                }</p>
                <p class="text-lg"><span class="font-bold">Personnel:</span> ${
                  item.personnel || ""
                }</p>
              </div>
            `;
            if (mapOnlyRef.current) {
              mapOnlyRef.current.showInfoWindow(content, {
                lat: item.specific_location.coordinates[1],
                lng: item.specific_location.coordinates[0],
              });
            }
          }
        }}
      />
    </div>
  );
};

export default MapContainer;
