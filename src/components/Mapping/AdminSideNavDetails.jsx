import { LogoNamed } from "../";
import UPBuilding from "../../assets/UPbuilding.jpg";
import { useEffect, useState, useMemo } from "react";
import { useGetPostsQuery, useGetBarangaysQuery } from "../../api/dengueApi";
import { CaretDown } from "phosphor-react";
import ImageExpansionModal from "../ImageExpansionModal";

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const AdminSideNavDetails = ({
  report,
  nearbyCount,
  nearbyReports = [],
  radius = 2,
  onBarangaySelect,
  selectedBarangay,
}) => {
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHour < 24)
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    if (diffDay === 1) return "yesterday";
    if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const coordinates = useMemo(() => {
    return report?.specific_location
      ? {
          lat: report.specific_location.coordinates[1],
          lng: report.specific_location.coordinates[0],
        }
      : undefined;
  }, [report?.specific_location?.coordinates]);

  const [address, setAddress] = useState("Loading address...");

  const { data: allReports } = useGetPostsQuery();
  const { data: barangays = [], isLoading: isLoadingBarangays } =
    useGetBarangaysQuery();

  useEffect(() => {
    let active = true;
    async function reverseGeocode() {
      try {
        if (!coordinates || !window.google) {
          setAddress("Unknown address");
          return;
        }
        const geocoder = new window.google.maps.Geocoder();
        const resp = await geocoder.geocode({ location: coordinates });
        if (!active) return;
        const formatted = resp?.results?.[0]?.formatted_address;
        setAddress(formatted || "Unknown address");
      } catch {
        if (active) setAddress("Unknown address");
      }
    }
    reverseGeocode();
    return () => {
      active = false;
    };
  }, [coordinates?.lat, coordinates?.lng]);

  const handleBarangayChange = (e) => {
    const id = e.target.value;
    const barangay = barangays.find((b) => b._id === id);
    console.debug("[AdminSideNavDetails] handleBarangayChange", {
      selectedId: id,
      found: !!barangay,
      barangayName: barangay?.name,
      barangayDisplay: barangay?.displayName,
    });
    if (barangay && onBarangaySelect) onBarangaySelect(barangay);
  };

  const [showDetails, setShowDetails] = useState(true);
  const [showStreetView, setShowStreetView] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [expandedImage, setExpandedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Accept either a name or an id for selectedBarangay; prefer id if it matches _id
  const resolvedSelectedId = useMemo(() => {
    const asId = barangays.find((b) => b._id === selectedBarangay)?._id;
    if (asId) return asId;
    const target = (selectedBarangay || "").toLowerCase();
    const byName = barangays.find(
      (b) =>
        (b.name || "").toLowerCase() === target ||
        (b.displayName || "").toLowerCase() === target
    );
    return byName?._id || "";
  }, [selectedBarangay, barangays]);

  useEffect(() => {
    console.debug("[AdminSideNavDetails] selectedBarangay changed", {
      selectedBarangay,
      resolvedSelectedId,
    });
  }, [selectedBarangay, resolvedSelectedId]);

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("validated") || s.includes("resolved"))
      return "bg-green-500/90 border-green-300/50";
    if (s.includes("pending")) return "bg-amber-500/90 border-amber-300/50";
    if (s.includes("under") || s.includes("investigation"))
      return "bg-blue-500/90 border-blue-300/50";
    if (s.includes("rejected")) return "bg-red-500/90 border-red-300/50";
    if (s.includes("confirmed")) return "bg-rose-500/90 border-rose-300/50";
    return "bg-white/20 border-white/40";
  };

  return (
    <aside className="flex flex-col justify-start items-center text-center py-4 z-[1000] fixed left-0 top-0 h-[100vh] bg-transparent w-[24vw] px-4 md:w-[30vw] max-w-[340px] text-primary space-y-3 overflow-hidden">
      <div className="flex flex-col items-center w-full space-y-3">
        <div className="w-full flex items-center justify-between mb-0 rounded-2xl bg-primary/80 backdrop-blur-md text-white shadow-lg border border-white/10 p-3">
          <LogoNamed theme="dark" iconSize="h-9 w-9" textSize="text-[24px]" />
        </div>

        <div className="w-full rounded-2xl bg-primary/80 backdrop-blur-md text-white shadow-lg border border-white/10 p-3">
          <label className="text-xs font-semibold text-white/90 mb-2 block">
            Select Barangay
          </label>
          <select
            className="w-full p-3 rounded-xl bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20 placeholder-white/70"
            value={resolvedSelectedId}
            onChange={(e) => {
              console.debug("[AdminSideNavDetails] onChange", {
                value: e.target.value,
              });
              handleBarangayChange(e);
            }}
          >
            <option value="" disabled hidden className="text-black bg-white">
              {isLoadingBarangays
                ? "Loading barangays..."
                : "Choose a barangay"}
            </option>
            {!isLoadingBarangays &&
              barangays.map((b) => (
                <option
                  key={b._id}
                  value={b._id}
                  className="text-black bg-white"
                >
                  {b.displayName || b.name}
                </option>
              ))}
          </select>
        </div>

        <div
          id="breeding-details"
          className="w-full rounded-2xl bg-primary/80 backdrop-blur-md text-white shadow-lg border border-white/10 overflow-hidden"
        >
          <div className="p-4 text-left flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-white">
                Breeding Site Details
              </p>
              <p className="text-sm text-white/80 mt-0.5">Overview and media</p>
            </div>
            <button
              className="px-2 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center"
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              aria-controls="breeding-details-body"
            >
              <CaretDown
                size={14}
                className={`${
                  showDetails ? "rotate-180" : "rotate-0"
                } transition-transform duration-200`}
              />
            </button>
          </div>
          {showDetails && (
            <div
              id="breeding-details-body"
              className="px-4 pb-4 space-y-4 text-left max-h-[68vh] overflow-auto"
            >
              {/* Street View */}
              <div
                className={`${
                  showStreetView
                    ? "pb-4 mb-4 border-b border-white/10"
                    : "pb-3 mb-3 border-b border-white/15"
                }`}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left text-base font-semibold text-white mb-2 hover:opacity-90"
                  onClick={() => setShowStreetView((v) => !v)}
                  aria-expanded={showStreetView}
                  aria-controls="street-view-body"
                >
                  <span>Street View</span>
                  <CaretDown
                    size={16}
                    className={`${
                      showStreetView ? "rotate-180" : "rotate-0"
                    } transition-transform duration-200`}
                  />
                </button>
                {showStreetView && (
                  <div id="street-view-body">
                    {coordinates ? (
                      <iframe
                        width="100%"
                        height="180"
                        style={{ border: 0, borderRadius: "12px" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=&layer=c&cbll=${coordinates.lat},${coordinates.lng}&cbp=11,0,0,0,0&z=18&output=svembed`}
                        title="Street View"
                      />
                    ) : (
                      <img
                        src={UPBuilding}
                        className="w-full h-[180px] object-cover rounded-xl"
                        alt="Street View"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="pb-4 mb-4 border-b border-white/10">
                <p className="text-base font-semibold text-white mb-1">
                  Location
                </p>
                <p className="text-base text-white/90 break-words">{address}</p>
                {report?.barangay && (
                  <p className="text-sm text-white/80 mt-1">
                    Barangay {report.barangay}
                  </p>
                )}
              </div>

              {/* Status & Type */}
              <div className="pb-4 mb-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-white/80">Type</p>
                    <p className="text-base font-medium text-white/90">
                      {report?.report_type || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Status</p>
                    <span
                      className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white border ${getStatusBadgeClass(
                        report?.status
                      )}`}
                    >
                      {report?.status || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reported and Reporter */}
              <div className="grid grid-cols-2 gap-3 pb-4 mb-4 border-b border-white/10">
                <div>
                  <p className="text-sm text-white/80">Reported</p>
                  <p className="text-base text-white/90">
                    {report?.date_and_time
                      ? `${getRelativeTime(report.date_and_time)} · ${new Date(
                          report.date_and_time
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Reporter</p>
                  <p className="text-base text-white/90">
                    {report?.isAnonymous
                      ? report?.anonymousId || "Anonymous"
                      : report?.user?.username || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {report?.description && (
                <div className="pb-4 mb-4 border-b border-white/10">
                  <p className="text-base font-semibold text-white mb-1">
                    Description
                  </p>
                  <p className="text-base whitespace-pre-line break-words text-white/90">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Images */}
              {Array.isArray(report?.images) && report.images.length > 0 && (
                <div
                  className={`${
                    showImages
                      ? "pb-2 mb-2 border-b border-white/10"
                      : "pb-3 mb-3 border-b border-white/15"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left text-base font-semibold text-white mb-2 hover:opacity-90"
                    onClick={() => setShowImages((v) => !v)}
                    aria-expanded={showImages}
                    aria-controls="images-body"
                  >
                    <span>Images</span>
                    <CaretDown
                      size={16}
                      className={`${
                        showImages ? "rotate-180" : "rotate-0"
                      } transition-transform duration-200`}
                    />
                  </button>
                  {showImages && (
                    <div id="images-body" className="grid grid-cols-3 gap-2">
                      {report.images.slice(0, 6).map((img, idx) => {
                        const src = typeof img === "string" ? img : img?.url;
                        return (
                          <img
                            key={idx}
                            src={src}
                            alt={`Report image ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-md cursor-zoom-in hover:ring-2 hover:ring-white/60"
                            onClick={() => {
                              setExpandedImage(src);
                              setIsImageModalOpen(true);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Nearby bar */}
              <div>
                <p className="text-base font-semibold text-white mb-2">
                  Nearby Reports ({nearbyCount})
                </p>
                <div className="w-full h-1.5 rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-primary/80"
                    style={{
                      width: `${Math.min(100, (nearbyCount / 10) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <ImageExpansionModal
          isOpen={isImageModalOpen}
          image={expandedImage}
          onClose={() => {
            setIsImageModalOpen(false);
            setExpandedImage(null);
          }}
        />
      </div>
    </aside>
  );
};

export default AdminSideNavDetails;
