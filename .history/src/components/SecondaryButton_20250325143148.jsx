import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon,
  strokeWidth = 3,
  iconColor = "stroke-primary",
  iconBg = "bg-primary", // Default background color for the icon
  iconSize = "", // Default size
  iconPadding = "", // Padding for background
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      ${maxWidth || ""} bg-gradient-to-b from-[#FADD37] to-[#F8A900]`}
    >
      {Icon && iconPosition === "left" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon
            className={`${iconSize} ${iconColor}`}
            style={{ strokeWidth }}
          />
        </div>
      )}
      <span className="text-md italic font-[Inter]">{text}</span>
      {Icon && iconPosition === "right" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon
            className={`${iconSize} ${iconColor}`}
            style={{ strokeWidth }}
          />
        </div>
      )}
    </div>
  );
};

export default SecondaryButton;
