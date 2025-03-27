import React from "react";
import profile1 from "../../assets/profile1.png";

const Comment = () => {
  return (
    <div className="flex gap-x-2 text-primary">
      <img src={profile1} className="h-11 mt-1" />
      <div>
        <div className="flex flex-col  rounded-3xl px-6 pt-2 pb-2 bg-base-200">
          <p className="font-bold">Anonymous Pig</p>
          <p className="mt-[-2px]">
            Stay safe, everyone! Let’s clean our surroundings.
          </p>
        </div>
        <div className="flex text-sm font-semibold gap-x-3 ml-6 mt-1">
          <p>1m</p>
          <p className="hover:opacity-50 cursor-pointer">Like</p>
          <p className="hover:opacity-50 cursor-pointer">Reply</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
