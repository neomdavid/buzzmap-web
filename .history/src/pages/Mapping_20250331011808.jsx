import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
const Mapping = () => {
  return (
    <div className="h-[60vw]">
      <MapContainer></MapContainer>
    </div>
  );
};

export default Mapping;
