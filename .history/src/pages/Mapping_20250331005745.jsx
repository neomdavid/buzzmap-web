import { MapContainer } from "react-leaflet";

const Mapping = () => {
  return (
    <>
      <div className="p-5">
        <MapContainer center={[48.8566, 2.3522]} zoom={13}></MapContainer>
      </div>
    </>
  );
};

export default Mapping;
