import React from "react";
import { Heart, ChatCircleDots, Share } from "phosphor-react";

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
    <section className="bg-base-200 px-8 py-6 rounded-lg">
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

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {images.slice(0, 4).map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  className={`w-full aspect-[4/3]  max-w-[300px] max-h-[225px] object-cover rounded-lg ${
                    index === 3 && images.length > 4 ? "opacity-70" : ""
                  }`}
                  alt={`Image ${index + 1}`}
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <p className="text-white text-lg font-semibold">
                      +{images.length - 4}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <hr className="text-gray-200 mt-4 mb-2" />
        <div className="flex justify-between">
          <div className="flex gap-x-2 py-2 px-2">
            <Heart size={18} className="cursor-pointer hover:opacity-80" />
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
            <Share size={18} className="cursor-pointer hover:opacity-80" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostCard;
