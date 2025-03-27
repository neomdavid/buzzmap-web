import React from "react";
import { Heart, ChatCircleDots, Share } from "phosphor-react";

const ReactionsTab = ({ likes, comments, shares }) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-x-2 py-2 px-2">
        <Heart size={18} weight="fill"cursor-pointer hover:opacity-80" />
        <p className="cursor-pointer hover:underline">{likes}</p>
      </div>
      <div className="flex gap-x-2 py-2 px-2">
        <ChatCircleDots size={18} className="cursor-pointer hover:opacity-80" />
        <p className="cursor-pointer hover:underline">{comments}</p>
      </div>
      <div className="flex gap-x-2 py-2 px-2">
        <p className="cursor-pointer hover:underline">{shares}</p>
        <Share size={18} className="cursor-pointer hover:opacity-80" />
      </div>
    </div>
  );
};

export default ReactionsTab;
