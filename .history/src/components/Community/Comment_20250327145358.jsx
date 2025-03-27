import React from "react";
import profile1 from "../../assets/profile1.png";

const Comment = () => {
  return (
    <div className="flex items-center gap-x-2 text-primary">
      <img src={profile1} className="h-11" />
      <div className="flex flex-col  rounded-xl px-4 py-3 bg-base-200">
        <p className="font-bold">Anonymous Pig</p>
        <p>Stay safe, everyone! Let’s clean our surroundings.</p>
      </div>
    </div>
  );
};

export default Comment;
