import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
const Mapping = () => {
  return (
    <>
      <div className="p-5">
        <MapContainer center={[48.8566, 2.3522]} zoom={13}>
          <TileLayer />
        </MapContainer>
      </div>
    </>
  );
};

export default Mapping;
