import { TileLayer, MapContainer, Marker } from "react-leaflet";

const Mapping = () => {
  const markers = [
    {
      geocode: [14.675, 121.0437],
      popUp: "Hello, I am pop 1",
    },
    {
      geocode: [14.686, 121.0437],
      popUp: "Hello, I am pop 1",
    },
    {
      geocode: [14.668, 121.0437],
      popUp: "Hello, I am pop 1",
    },
  ];
  return (
    <div className="h-[60vw]">
      <MapContainer center={[14.676, 121.0437]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker position={marker.geocode}></Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Mapping;
