import React from "react";
import surveillanceLogo from "../../assets/icons/quezon_surveillance.svg";
const AnnouncementCard = () => {
  return (
    <section className="bg-primary text-white flex flex-col p-4 rounded-2xl ">
      <div className="flex justify-between">
        <div>
          <img src={surveillanceLogo} className="h-13" />
        </div>
      </div>
      <div></div>
      <div></div>
    </section>
  );
};

export default AnnouncementCard;
