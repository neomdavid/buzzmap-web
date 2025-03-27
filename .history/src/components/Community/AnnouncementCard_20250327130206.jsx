import React from "react";
import surveillanceLogo from "../../assets/icons/quezon_surveillance.svg";
const AnnouncementCard = () => {
  return (
    <section className="bg-primary text-white flex flex-col p-4 py-6 rounded-2xl ">
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <img src={surveillanceLogo} className="h-14" />
          <div className="flex flex-col">
            <h1 className="text-4xl">Important Announcement</h1>
            <p className="font-bold text-xs">
              <span className="font-semibold">From</span> Quezon City
              Epidemiology & Surveillance Division (CESU)
            </p>
          </div>
        </div>
      </div>
      <div></div>
      <div></div>
    </section>
  );
};

export default AnnouncementCard;
