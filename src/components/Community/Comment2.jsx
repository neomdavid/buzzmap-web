import React from "react";

const Comment2 = ({
  username,
  profileImg,
  comment,
  timestamp,
  bgColor = "bg-base-200",
  profileSize = "h-11 w-11",
  textSize = "text-base",
}) => {


  return (
    <div className="flex gap-x-2 text-primary">
      <img src={profileImg} alt={username} className={`h-12 w-12 mt-2 rounded-full flex-shrink-0`} />
      <div className="flex-1 min-w-0 w-fit">
        <div className={`flex flex-col rounded-3xl px-6 pt-3 pb-3 ${bgColor}`}>
          <p className={`font-bold ${textSize}`}>{username}</p>
          <p className={`${textSize} break-words whitespace-pre-wrap`}>{comment}</p>
        </div>
        <div className="flex text-sm font-semibold gap-x-4 ml-6 mt-1">
          <p>{timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default Comment2;
