import React from "react";
import { Heart, ChatCircleDots } from "phosphor-react";
import { IconShare3 } from "@tabler/icons-react";

const ReactionsTab = ({
  likes,
  comments,
  shares,
  iconSize = 18,
  textSize = "text-md",
  className,
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <Heart
          size={iconSize}
          weight="fill"
          className="cursor-pointer hover:opacity-80"
        />
        <p className={`cursor-pointer font-light hover:underline ${textSize}`}>
          {likes}
        </p>
      </div>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <ChatCircleDots
          size={iconSize}
          className="cursor-pointer hover:opacity-80"
        />
        <p
          className={`cursor-pointer font-light not-only:hover:underline ${textSize}`}
        >
          {comments}
        </p>
      </div>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <p className={`cursor-pointer font-light hover:underline ${textSize}`}>
          {shares}
        </p>
        <IconShare3
          size={iconSize}
          stroke={1}
          className="cursor-pointer hover:opacity-80"
        />
      </div>
    </div>
  );
};

export default ReactionsTab;
