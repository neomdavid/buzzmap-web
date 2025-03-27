import React from "react";
import ReactionsTab from "./ReactionsTab";
import { DotsThree } from "phosphor-react";
import ImageGrid from "./ImageGrid";

const PostCard = ({
  profileImage,
  username,
  timestamp,
  location,
  dateTime,
  reportType,
  description,
  likes,
  comments,
  shares,
  images = [],
}) => {
  return (
    <section className="bg-base-200  px-8 py-6 rounded-lg">
      <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-x-4">
            <img
              src={profileImage}
              className="h-11 w-11 rounded-full"
              alt="Profile"
            />
            <div className="flex flex-col">
              <p className="font-bold">{username}</p>
              <p className="text-sm text-gray-500">{timestamp}</p>
            </div>
          </div>
          <DotsThree size={28} />
        </div>
        <div className="text-primary">
          <p>
            <span className="font-bold">📍 Location:</span> {location}
          </p>
          <p>
            <span className="font-bold">🕑 Date & Time:</span> {dateTime}
          </p>
          <p>
            <span className="font-bold">⚠️ Report Type:</span> {reportType}
          </p>
          <p className="font-bold">
            📝 Description: <br />
            <span className="font-normal block ml-1">{description}</span>
          </p>
        </div>

        <ImageGrid images={images} />

        <hr className="text-gray-200 mt-4 mb-2" />
        <ReactionsTab likes={likes} comments={comments} shares={shares} />
      </div>
    </section>
  );
};

export default PostCard;
