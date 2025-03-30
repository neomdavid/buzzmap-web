const DengueMap = () => {
  const markers = [
    {
      geocode: [14.675, 121.0437],
      popUp: "Hello, I am pop 1",
    },
    {
      geocode: [14.675, 121.06],
      popUp: "Hello, I am pop 1",
    },
    {
      geocode: [14.66, 121.05],
      popUp: "Hello, I am pop 1",
    },
  ];

  // const customIcon = new Icon({
  //   iconUrl: require("../assets/icons/share.svg"),
  //   iconSize: [38, 38],
  // });
  return (
    <div className="h-[60vw] w-[50vw] m-auto rounded-xl overflow-hidden mt-10">
      <MapContainer center={[14.676, 121.0437]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker position={marker.geocode}>
            <Popup>
              <h2 className="text-3xl">Suspected Dengue Case</h2>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
export default DengueMap;
