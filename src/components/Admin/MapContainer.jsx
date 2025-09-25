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
  baseUrl = "/mapping",
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
        className="map-container-full"
        useAdminEndpoint={true}
        baseUrl={baseUrl}
        onMarkerClick={(item, type) => {
          if (type === "report") {
            setSelectedFullReport(item);
            setShowFullReport(true);
          } else if (type === "intervention") {
            // Create and show info window for intervention
            try {
              console.debug(
                "[Admin/MapContainer] Clicked intervention marker (raw object):",
                item
              );
            } catch (_) {}
            const content = document.createElement("div");
            const dateValue =
              item.date ||
              item.date_and_time ||
              item.createdAt ||
              item.updatedAt ||
              null;
            const description = item.description || item.details || "";
            const address = item.address || item.location || "";
            content.innerHTML = `
              <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white text-center rounded-md shadow-md text-primary">
                <p class="text-4xl font-extrabold text-primary mb-2">${
                  item.interventionType || item.type || "Intervention"
                }</p>
                <div class="text-lg flex items-center gap-2">
                  <span class="font-bold">Status:</span>
                  <span class="px-3 py-1 rounded-full text-white font-bold text-sm status-badge-intervention">
                    ${item.status || ""}
                  </span>
                </div>
                <p class="text-lg text-center"><span class="font-bold">Barangay:</span> ${
                  item.barangay || ""
                }</p>
                ${
                  address
                    ? `<p class=\"text-lg text-center\"><span class=\"font-bold text-center\">Address:</span> ${address}</p>`
                    : ""
                }
                ${
                  dateValue
                    ? `<p class=\"text-lg\"><span class=\"font-bold\">Date:</span> ${new Date(
                        dateValue
                      ).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}</p>`
                    : ""
                }
                ${
                  description
                    ? `<p class=\"text-lg text-center\"><span class=\"font-bold\">Description:</span> ${description}</p>`
                    : ""
                }
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
