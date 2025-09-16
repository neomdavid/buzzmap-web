import { LogoNamed } from "../";
import UPBuilding from "../../assets/UPbuilding.jpg";
import { useEffect, useState, useMemo } from "react";
import { useGetPostsQuery, useGetBarangaysQuery } from "../../api/dengueApi";

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
    if (barangay && onBarangaySelect) onBarangaySelect(barangay);
  };

  return (
    <aside className="flex flex-col justify-start items-center text-center py-4 z-[1000] fixed left-0 top-0 h-[100vh] bg-white w-[24vw] shadow-[10px_0px_10px_rgba(0,0,0,0.1)] px-5 md:w-[30vw] max-w-[330px] text-primary">
      <div className="flex flex-col items-center w-full">
        <div className="w-full flex items-center justify-between mb-3">
          <LogoNamed iconSize="h-9 w-9" textSize="text-[24px]" />
          <span className="text-xs text-gray-400">Admin Mapping</span>
        </div>

        <div className="relative mt-2 mb-4 w-full">
          <select
            className="w-full p-3 border-[1.5px] border-gray-300 rounded-xl bg-white text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            value={
              selectedBarangay
                ? barangays.find((b) => b.name === selectedBarangay)?._id || ""
                : ""
            }
            onChange={handleBarangayChange}
          >
            <option value="" disabled>
              Select Barangay
            </option>
            {isLoadingBarangays ? (
              <option disabled>Loading barangays...</option>
            ) : (
              barangays.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.displayName || b.name}
                </option>
              ))
            )}
          </select>
        </div>

        {coordinates ? (
          <div
            style={{ width: "100%", height: "180px", marginBottom: "0.5rem" }}
          >
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
            className="w-full object-cover rounded-2xl mb-8  md:h-[20vh]"
            alt="Street View"
          />
        )}
        <p className="text-[22px] font-semibold mr-1 ml-1 mb-6 mt-4 tracking-wide leading-7">
          {address}
        </p>
        <p className="text-lg font-bod text-gray-500 mr-1 mb-5 ml-1">
          {report?.barangay
            ? `Barangay ${report.barangay}`
            : "Barangay not available"}
        </p>
      </div>

      <div className="flex flex-col w-full mt-2 text-center bg-white/70 rounded-xl p-3 border border-gray-200 shadow-sm">
        <p className="text-[14px] font-semibold mb-1">
          Number of Nearby Reports (within {radius} km): {nearbyCount}
        </p>
        <div className="w-full h-1.5 rounded bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-primary/70"
            style={{ width: `${Math.min(100, (nearbyCount / 10) * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
};

export default AdminSideNavDetails;
