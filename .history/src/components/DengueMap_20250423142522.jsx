import { TileLayer, MapContainer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";

const DengueMap = ({ className = "" }) => {
  const navigate = useNavigate();

  const markers = [
    { geocode: [14.675, 121.0437], id: 123 },
    { geocode: [14.675, 121.06], id: 124 },
    { geocode: [14.66, 121.05], id: 125 },
  ];

  return (
    <div className={`w-full h-full ${className} z-[1]`}>
      <MapContainer
        center={[14.676, 121.0437]}
        zoom={13}
        className="w-full h-full rounded-sm  z-[1]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.geocode}
            eventHandlers={{
              click: () => navigate(`/mapping/${marker.id}`),
            }}
          >
            <Popup>
              <h2 className="text-3xl">Suspected Dengue Case</h2>
              <p className="text-sm text-gray-600">Click marker for details.</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DengueMap;
