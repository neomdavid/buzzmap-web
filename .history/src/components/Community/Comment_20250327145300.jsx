import React from "react";
import profile1 from "../../assets/profile1.png";

const Comment = () => {
  return (
    <div className="flex items-center gap-x-2">
      <img src={profile1} className="h-11" />
      <div className="flex flex-col items-center rounded-xl px-4 py-3 bg-base-200">
        <p>Anonymous Pig</p>
        <p>Anonymous Pig</p>
      </div>
    </div>
  );
};

export default Comment;
