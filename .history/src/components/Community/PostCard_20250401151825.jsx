import React from "react";
import ReactionsTab from "./ReactionsTab";
import ImageGrid from "./ImageGrid";
import UserDetailsTab from "../";

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
    <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
      <UserDetailsTab
        profileImage={profileImage}
        username={username}
        timestamp={timestamp}
      />
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
  );
};

export default PostCard;
