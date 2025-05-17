import React from "react";
import surveillanceLogo from "../../assets/icons/quezon_surveillance.png";
import announcementImg from "../../assets/announcementimg.png"; // Default image
import profile1 from "../../assets/profile1.png";

import { DotsThree } from "phosphor-react";
import ImageGrid from "./ImageGrid";
import ReactionsTab from "./ReactionsTab";
import Comment from "./Comment";

const AnnouncementCard = ({ announcement }) => { // Accept announcement as a prop
  // Use dynamic data if available, otherwise fallback to static/default values
  const title = announcement?.title || "Important Announcement";
  // Split content by newline characters for rendering paragraphs
  const contentParts = announcement?.content?.split('\n') || [
    "🚨 DENGUE OUTBREAK IN QUEZON CITY! 🚨",
    "",
    "Quezon City is currently facing a dengue outbreak, with cases surging by 200% from January 1 to February 14. Residents are urged to take immediate precautions to prevent the spread of the disease.",
    "",
    "🔴 What You Need to Know:",
    "✅ Dengue cases have drastically increased—stay alert!",
    "Read more...",
  ];
  const images = announcement?.images && announcement.images.length > 0 ? announcement.images : [announcementImg];
  // For simplicity, reactions are kept static for now, but could also be dynamic
  const likes = announcement?.likesCount || "100k"; // Assuming likesCount might come from data
  const commentsCount = announcement?.commentsCount || "43k"; // Assuming commentsCount might come from data
  const shares = announcement?.sharesCount || "20k"; // Assuming sharesCount might come from data

  return (
    <div className="flex flex-col">
      <section className="bg-primary text-white flex flex-col p-6 py-6 rounded-2xl">
        <div className="flex justify-between mb-8">
          <div className="flex gap-x-3">
            <img src={surveillanceLogo} className="h-14" />
            <div className="flex flex-col">
              {/* Use dynamic title */}
              <h1 className="text-4xl">{title}</h1>
              <p className="font-semibold text-xs">
                <span className="font-normal">From</span> Quezon City
                Epidemiology & Surveillance Division (CESU)
              </p>
            </div>
          </div>
          <DotsThree size={32} />
        </div>

        <div className="mb-4">
          {/* Render content parts as paragraphs */}
          {contentParts.map((part, index) => (
            <p key={index} className={part.includes("Read more...") ? "italic underline font-semibold" : ""}>
              {part === "" ? <br /> : part}
            </p>
          ))}
          {/* Use dynamic images */}
          {images.length > 0 && (
            <div className="mt-4">
              {/* Assuming ImageGrid can handle an array of URLs */}
              <ImageGrid images={images} sourceType={announcement?.images ? "url" : "import"} />
            </div>
          )}
        </div>

        <div>
          <ReactionsTab
            likes={likes}
            comments={commentsCount}
            shares={shares}
            iconSize={21}
            textSize="text-lg"
            className={"mb-2"}
          />
          <hr className="text-white opacity-35 mb-4" />
          <div className="flex">
            <img src={profile1} className="h-11 w-11 rounded-full mr-3" />
            <input
              className="bg-white opacity-93 rounded-2xl placeholder-primary/70 px-4 w-full text-primary focus:outline-none"
              placeholder="Comment on this post..."
              type="text"
            />
          </div>
        </div>
      </section>

      {/* Remove the static comments section
      <section className="py-4 px-4">
        <p className="text-primary mb-4 opacity-65 font-semibold text-lg">
          Comments from the Community
        </p>
        <div>
          <div className="flex flex-col gap-4">
            <Comment
              username="Anonymous Pig"
              comment="Stay safe, everyone! Let's clean our surroundings."
            />
            <Comment
              username="Anonymous Cat"
              comment="Saw stagnant water near our street. Reporting it now!"
            />
            <Comment
              username="Anonymous Unicorn"
              comment="Thanks for the update. Time to check for mosquito breeding spots."
            />
            <Comment
              username="Anonymous Shrimp"
              comment="Let's all do our part. Wear repellents and cover up!"
            />
            <Comment
              username="Anonymous Tiger"
              comment="Let's stay vigilant. Always use mosquito nets at night!"
            />
            <Comment
              username="Anonymous Elephant"
              comment="QC residents, don't forget to check your water containers!"
            />
            <Comment
              username="Anonymous Elephant"
              comment="QC residents, don't forget to check your water containers!"
            />
            <Comment
              username="Anonymous Elephant"
              comment="QC residents, don't forget to check your water containers!"
            />
          </div>
        </div>
      </section>
      */}
    </div>
  );
};

export default AnnouncementCard;
