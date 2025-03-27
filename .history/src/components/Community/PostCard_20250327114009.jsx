import React from "react";
import {
  DotsThree,
  Heart,
  ChatCircleDots,
  Image as IconShare3,
} from "phosphor-react";

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
  const maxImages = 4;
  const extraImages = images.length - maxImages;
  const displayImages = images.slice(0, maxImages);

  return (
    <section className="bg-base-200 px-8 py-6 rounded-lg">
      <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-x-4">
            <img src={profileImage} className="h-11" alt="Profile" />
            <div className="flex flex-col">
              <p className="font-bold">{username}</p>
              <p className="text-sm">{timestamp}</p>
            </div>
          </div>
          <DotsThree
            size={30}
            className="hover:opacity-55 transition-all duration-200 cursor-pointer"
          />
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
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {displayImages.map((img, index) => (
              <img
                key={index}
                src={img}
                className="rounded-lg w-full h-24 object-cover"
                alt={`Post image ${index + 1}`}
              />
            ))}
            {extraImages > 0 && (
              <div className="flex items-center justify-center bg-black bg-opacity-50 rounded-lg text-white text-lg font-bold w-full h-24">
                +{extraImages}
              </div>
            )}
          </div>
        )}
        <hr className="text-gray-200 mt-4 mb-2" />
        <div className="flex justify-between">
          <div className="flex gap-x-2 py-2 px-2">
            <Heart
              weight="fill"
              size={18}
              className="cursor-pointer hover:opacity-80"
            />
            <p className="cursor-pointer hover:underline">{likes}</p>
          </div>
          <div className="flex gap-x-2 py-2 px-2">
            <ChatCircleDots
              size={18}
              className="cursor-pointer hover:opacity-80"
            />
            <p className="cursor-pointer hover:underline">{comments}</p>
          </div>
          <div className="flex gap-x-2 py-2 px-2">
            <p className="cursor-pointer hover:underline">{shares}</p>
            <IconShare3
              size={18}
              stroke={1}
              className="cursor-pointer hover:opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostCard;
