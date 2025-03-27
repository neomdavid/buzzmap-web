import React from "react";
import profile1 from "../../assets/profile1.png";

const Comment = () => {
  return (
    <div className="flex items-center gap-x-2 text-primary">
      <img src={profile1} className="h-11" />
      <div>
        <div className="flex flex-col  rounded-3xl px-6 py-4 bg-base-200">
          <p className="font-bold">Anonymous Pig</p>
          <p className="mt-[-2px]">
            Stay safe, everyone! Let’s clean our surroundings.
          </p>
        </div>
        <div className="flex text-sm font-semibold gap-x-3 ml-4">
          <p>1m</p>
          <p>Like</p>
          <p>Reply</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
