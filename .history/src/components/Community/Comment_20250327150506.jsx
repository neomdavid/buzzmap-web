import React from "react";

const Comment = ({ username, profileImg, comment }) => {
  return (
    <div className="flex gap-x-2 text-primary">
      <img src={profileImg} alt={username} className="h-11 mt-1 rounded-full" />
      <div>
        <div className="flex flex-col rounded-3xl px-6 pt-2 pb-2 bg-base-200">
          <p className="font-bold">{username}</p>
          <p className="mt-[-2px]">{comment}</p>
        </div>
        <div className="flex text-sm font-semibold gap-x-4 ml-6 mt-1">
          <p>1m</p>
          <p className="hover:opacity-50 cursor-pointer">Like</p>
          <p className="hover:opacity-50 cursor-pointer">Reply</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
