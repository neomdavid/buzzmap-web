import React from "react";
import profile1 from "../../assets/profile1.png";
import { ArrowFatUp, ArrowFatDown } from "phosphor-react";

const Comment2 = ({ username, profileImg = profile1, comment, bgColor = "bg-base-200", profileSize = "h-11", textSize = "text-base" }) => {
  return (
    <div className="flex gap-x-1.5 text-black">
      <img src={profileImg} alt={username} className={`${profileSize} mt-1.5 rounded-full`} />
      <div>
        <div className={`flex flex-col rounded-3xl px-6 pl-5 pt-3 pb-3 bg-gray-200/50`}>
          <p className={`font-bold ${textSize}`}>{username}</p>
          <p className={textSize}>{comment}</p>
        </div>
        <div className="flex items-center text-sm font-semibold gap-x-4 ml-6 mt-1">
          <p>1m</p>
          <ArrowFatUp size={22} className="cursor-pointer hover:bg-gray-200/50 rounded-full p-1" />
          <ArrowFatDown size={22} className="cursor-pointer  hover:bg-gray-200/50 rounded-full p-1" />
        </div>
      </div>
    </div>
  );
};

export default Comment2;
