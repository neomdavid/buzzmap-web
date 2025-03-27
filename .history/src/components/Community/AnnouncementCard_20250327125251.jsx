import React from "react";
import surveillanceLogo from "../../assets/icons/quezon_surveillance.svg";
const AnnouncementCard = () => {
  return (
    <section className="bg-base-200 text-white flex flex-col">
      <div className="flex justify-between">
        <div>
          <img src={surveillanceLogo} className="h-12" />
        </div>
      </div>
      <div></div>
      <div></div>
    </section>
  );
};

export default AnnouncementCard;
