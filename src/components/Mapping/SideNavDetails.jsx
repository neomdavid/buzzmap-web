import { CustomDropDown, SecondaryButton, LogoNamed } from "../";
import UPBuilding from "../../assets/UPbuilding.jpg";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useGetPostsQuery, useGetBarangaysQuery } from "../../api/dengueApi";
import NewPostModal from "../Community/NewPostModal";
import { useSelector } from "react-redux";
import { toastInfo } from "../../utils.jsx";

// Helper: Haversine formula for distance in meters
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // meters
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

const SideNavDetails = ({ 
  report, 
  nearbyCount, 
  nearbyReports = [], 
  radius = 2, 
  onReportBreedingSite,
  onViewCommunityClick,
  onPreventionTipsClick,
  onBarangaySelect // Add callback for when barangay is selected
}) => {
  // Get user from Redux store
  const userFromStore = useSelector((state) => state.auth?.user);

  // Extract coordinates for geocoding and street view - memoize to prevent re-calculations
  const coordinates = useMemo(() => {
    return report?.specific_location
      ? {
          lat: report.specific_location.coordinates[1],
          lng: report.specific_location.coordinates[0],
        }
      : undefined;
  }, [report?.specific_location?.coordinates]);

  const [address, setAddress] = useState("Loading address...");

  // Fetch all reports (could be filtered by status if needed)
  const { data: allReports } = useGetPostsQuery();
  
  // Fetch all barangays for the dropdown
  const { data: barangays = [], isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  // Calculate number of nearby reports (within 2,000 meters, excluding self) - memoize calculation
  const nearbyCountCalculated = useMemo(() => {
    if (!allReports || !coordinates) return 0;
    return allReports.filter((r) => {
      if (
        !r.specific_location ||
        !Array.isArray(r.specific_location.coordinates) ||
        r._id === report._id // Exclude self
      )
        return false;
      const [lng, lat] = r.specific_location.coordinates;
      const dist = getDistanceMeters(
        coordinates.lat,
        coordinates.lng,
        lat,
        lng
      );
      return dist <= 1000; // 2,000 meters (2 km) radius
    }).length;
  }, [allReports, coordinates?.lat, coordinates?.lng, report?._id]);

  // Compute most common type - memoize calculation
  const mostCommonType = useMemo(() => {
    if (!nearbyReports.length) return "N/A";
    const counts = {};
    nearbyReports.forEach(r => {
      counts[r.report_type] = (counts[r.report_type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [nearbyReports]);

  // Compute most recent date - memoize calculation
  const mostRecentDate = useMemo(() => {
    if (!nearbyReports.length) return "N/A";
    
    const maxDate = new Date(
      Math.max(...nearbyReports.map(r => new Date(r.date_and_time).getTime()))
    );
    return (
      maxDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " " +
      maxDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, [nearbyReports]);

  // Compute unique barangays and their names - memoize calculation
  const barangayData = useMemo(() => {
    const barangaySet = new Set(nearbyReports.map(r => r.barangay));
    const uniqueBarangays = barangaySet.size;
    const barangayList = Array.from(barangaySet).filter(Boolean);
    return { uniqueBarangays, barangayList };
  }, [nearbyReports]);

  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  // Modal state for barangay list and report
  const [modalMode, setModalMode] = useState(null); // null | "barangays" | "report"
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const newPostModalRef = useRef(null);

  // Google Street View Static API URL - memoize to prevent re-calculations
  const streetViewUrl = useMemo(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return coordinates
      ? `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates.lat},${coordinates.lng}&fov=80&heading=70&pitch=0&key=${apiKey}`
      : UPBuilding;
  }, [coordinates]);

  // Memoize the barangay selection handler
  const handleBarangayChange = useCallback((e) => {
    const selectedValue = e.target.value;
    if (selectedValue && onBarangaySelect) {
      const barangay = barangays.find(b => b._id === selectedValue);
      console.log('[DEBUG] Selected barangay:', barangay);
      onBarangaySelect(barangay);
    }
  }, [barangays, onBarangaySelect]);

  useEffect(() => {
    if (!coordinates) {
      setAddress("No location selected");
      return;
    }
    const fetchAddress = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === "OK" && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
        } else {
          setAddress("Address not found");
        }
      } catch (err) {
        setAddress("Failed to fetch address");
      }
    };
    fetchAddress();
  }, [coordinates?.lat, coordinates?.lng]);

  // Open the dialog when showNewPostModal becomes true
  useEffect(() => {
    if (showNewPostModal && newPostModalRef.current) {
      newPostModalRef.current.showModal();

      // Add a close event listener to unmount the modal when closed
      const handleDialogClose = () => setShowNewPostModal(false);
      const dialog = newPostModalRef.current;
      dialog.addEventListener("close", handleDialogClose);

      // Cleanup
      return () => {
        dialog.removeEventListener("close", handleDialogClose);
      };
    }
  }, [showNewPostModal]);

  return (
    <aside
      className="flex flex-col justify-around items-center text-center py-4 text-white z-10000000 absolute bottom-0 h-[100vh] bg-primary w-[28vw] shadow-[10px_0px_10px_rgba(0,0,0,0.3)] px-5 
md:w-[35vw]   max-w-[370px] "
    >
      <div className="flex flex-col items-center">
        <LogoNamed theme="dark" iconSize="h-11 w-11" textSize="text-[30px]" />
        
        {/* Barangay Selection */}
        <div className="relative mt-4 mb-4 w-full max-w-sm">
          <select
            className="w-full p-3 border-[1.5px] border-white rounded-full bg-white text-primary text-sm focus:outline-none focus:ring-1 focus:ring-base-200"
            defaultValue=""
            onChange={handleBarangayChange}
          >
            <option value="" disabled>Select Barangay</option>
            {isLoadingBarangays ? (
              <option disabled>Loading barangays...</option>
            ) : (
              barangays.map(b => (
                <option key={b._id} value={b._id}>
                  {b.displayName || b.name}
                </option>
              ))
            )}
          </select>
        </div>
        {/* Use Google Maps Street View iframe (not satellite) */}
        {coordinates ? (
          <div style={{ width: "100%", height: "180px", marginBottom: "0.5rem" }}>
            <iframe
              width="100%"
              height="180"
              style={{ border: 0, borderRadius: "16px" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=&layer=c&cbll=${coordinates.lat},${coordinates.lng}&cbp=11,0,0,0,0&z=18&output=svembed`}
              title="Street View"
            />
          </div>
        ) : (
          <img
            src={UPBuilding}
            className="w-full object-cover rounded-2xl mb-4 md:h-[20vh]"
            alt="Street View"
          />
        )}
        <p className="text-[27px] mr-4 ml-1 mb-3 mt-2 tracking-wide leading-8 md:text-[23px]">
          {address}
        </p>
        <p className="text-[16px] font-light mr-4 ml-1 md:text-[12px]">
          {report?.barangay ? `Barangay ${report.barangay}` : "Barangay not available"}
        </p>

      </div>
      <div className="flex flex-col">
        <div className="flex flex-col text-[14px] ml-[-2px] font-light md:text-[13px]">
          <p className="text-[16px] font-semibold mb-2 md:text-[14px]">
            Number of Nearby Reports (within {radius} km): {nearbyCount}
          </p>
          <p>📊 Most Common Nearby Type: {mostCommonType}</p>
          <p>🕒 Most Recent Nearby Report: {mostRecentDate}</p>
          <div
            className="relative w-fit self-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            tabIndex={0}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            style={{ cursor: barangayData.barangayList.length > 0 ? "pointer" : "default" }}
          >
            <p>
              🏘️ Barangays Represented Nearby:{" "}
              <span
                className="underline cursor-pointer"
                style={{ textDecorationThickness: "2px" }}
                onClick={() => barangayData.barangayList.length > 0 && setModalMode("barangays")}
                tabIndex={0}
                onKeyDown={e => {
                  if ((e.key === "Enter" || e.key === " ") && barangayData.barangayList.length > 0) setModalMode("barangays");
                }}
                aria-label="Show barangays represented nearby"
              >
                {barangayData.uniqueBarangays}
              </span>
            </p>
            {showTooltip && barangayData.barangayList.length > 0 && (
              <div className="absolute left-2/3 -translate-x-1/2 mt-2 bg-white text-primary text-md rounded shadow-lg px-3 py-2 z-50 min-w-[120px] max-w-[200px]">
                <div className="font-semibold mb-1">Nearby Barangays:</div>
                <ul className="text-center">
                  {barangayData.barangayList.map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center mx-2 gap-y-4 text-[12px] text-primary">
        <button
          type="button"
          onClick={() => {
            if (!userFromStore || userFromStore.name === "Guest") {
              toastInfo("You must be logged in to report a breeding site.");
              return;
            }
            setShowNewPostModal(true);
          }}
          className={`
            flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
            hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
            bg-gradient-to-b from-[#FADD37] to-[#F8A900] h-[25%] w-full max-w-[200px]
            text-md text-primary italic font-[Inter] text-nowrap
          `}
        >
          Report a Breeding Site
        </button>
        <button
          type="button"
          onClick={onViewCommunityClick}
          className={`
            flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
            hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
            bg-gradient-to-b from-[#FADD37] to-[#F8A900] h-[25%] w-full max-w-[200px]
            text-md text-primary italic font-[Inter] text-nowrap
          `}
        >
          View Reports by the Community
        </button>
        <button
          type="button"
          onClick={onPreventionTipsClick}
          className={`
            flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
            hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
            bg-gradient-to-b from-[#FADD37] to-[#F8A900] h-[25%] w-full max-w-[200px]
            text-md text-primary italic font-[Inter] text-nowrap
          `}
        >
          Prevention Tips
        </button>
      </div>
      {/* <div className="flex flex-col text-sm text-center font-light mx-4">
        <p>
          Heads up! Your data helps power community safety insights. Learn how
          we protect it in our
        </p>
        <p className="font-semibold italic underline">
          Privacy & Data Disclaimer.
        </p>
      </div> */}
      {/* DaisyUI dialog modal for barangays only */}
      <dialog
        id="side_nav_modal"
        className="modal z-[10000]"
        open={modalMode === "barangays"}
        onClose={() => setModalMode(null)}
      >
        <form method="dialog" className="modal-box bg-white text-primary">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setModalMode(null)}
            type="button"
          >
            ✕
          </button>
          <p className="font-extrabold text-xl mb-3">Barangays Represented Nearby</p>
          {barangayData.barangayList.length > 0 ? (
            <ul className="text-left text-lg text-base">
              {barangayData.barangayList.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No barangays found.</div>
          )}
        </form>
        <form method="dialog" className="modal-backdrop z-[10000]">
          <button onClick={() => setModalMode(null)}>close</button>
        </form>
      </dialog>
      {/* Show NewPostModal when requested */}
      {showNewPostModal && (
        <NewPostModal
          ref={newPostModalRef}
          onSubmit={() => setShowNewPostModal(false)}
          initialCoordinates={report?.specific_location
            ? `${report.specific_location.coordinates[1]}, ${report.specific_location.coordinates[0]}`
            : ""}
          initialBarangay={report?.barangay || ""}
        />
      )}
    </aside>
  );
};

export default SideNavDetails;
