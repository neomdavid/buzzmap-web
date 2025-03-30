import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const DengueMap = () => {
  return (
    <MapContainer
      center={[14.676, 121.043]} // Quezon City coordinates
      zoom={12}
      className="w-full h-[500px]"
    >
      {/* Free OpenStreetMap Tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Example Marker */}
      <Marker position={[14.676, 121.043]}>
        <Popup>Dengue Case Reported Here!</Popup>
      </Marker>
    </MapContainer>
  );
};

export default DengueMap;
