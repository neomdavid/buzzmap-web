import React from "react";
import profile1 from "../../assets/profile1.png";
import { ArrowFatUp, ArrowFatDown } from "phosphor-react";

const Comment = ({ username, profileImg = profile1, comment, bgColor = "bg-base-200", profileSize = "h-11", textSize = "text-base" }) => {
  return (
    <div className="flex gap-x-2 text-primary">
      <img src={profileImg} alt={username} className={`${profileSize} mt-2 rounded-full`} />
      <div>
        <div className={`flex flex-col rounded-3xl px-6 pt-3 pb-3 ${bgColor}`}>
          <p className={`font-bold ${textSize}`}>{username}</p>
          <p className={textSize}>{comment}</p>
        </div>
        <div className="flex text-sm font-semibold gap-x-4 ml-6 mt-1">
          <p>1m</p>
          <ArrowFatUp size={18} className="cursor-pointer hover:opacity-50" />
          <ArrowFatDown size={18} className="cursor-pointer hover:opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default Comment;
