import React from "react";
import surveillanceLogo from "../../assets/icons/quezon_surveillance.svg";
import announcementImg from "../../assets/announcementimg.png";
import profile1 from "../../assets/profile1.png";

import { DotsThree } from "phosphor-react";
import ImageGrid from "./ImageGrid";
import ReactionsTab from "./ReactionsTab";

const AnnouncementCard = () => {
  return (
    <section className="bg-primary text-white flex flex-col p-6 py-6 rounded-2xl ">
      <div className="flex justify-between mb-8">
        <div className="flex gap-x-3">
          <img src={surveillanceLogo} className="h-14" />
          <div className="flex flex-col">
            <h1 className="text-4xl">Important Announcement</h1>
            <p className="font-semibold text-xs">
              <span className="font-normal">From</span> Quezon City Epidemiology
              & Surveillance Division (CESU)
            </p>
          </div>
        </div>
        <DotsThree size={32} />
      </div>

      <div className="mb-4">
        <p>🚨 DENGUE OUTBREAK IN QUEZON CITY! 🚨</p>
        <br />
        <p>
          Quezon City is currently facing a{" "}
          <span className="font-semibold">dengue outbreak</span>, with cases
          surging by{" "}
          <span className="font-semibold">
            200% from January 1 to February 14
          </span>
          . Residents are urged to take immediate precautions to prevent the
          spread of the disease.
        </p>
        <br />
        <p>
          🔴 What You Need to Know:
          <br />✅ Dengue cases have drastically increased—stay alert!
          <br />
          <span className="italic underline font-semibold">Read more...</span>
        </p>
        <ImageGrid images={[announcementImg]} />
      </div>

      <div>
        <ReactionsTab
          likes={"100k"}
          comments={"43k"}
          shares={"20k"}
          iconSize={21}
          textSize="text-lg"
          className={"mb-2"}
        />
        <hr className="text-white opacity-35 mb-4" />
        <div className="flex">
          <img src={profile1} className="h-11 w-11 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default AnnouncementCard;
