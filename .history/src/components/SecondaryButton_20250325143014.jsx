import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon,
  strokeWidth = 2, // Default stroke width
  iconColor = "stroke-primary", // Default stroke color
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      ${maxWidth || ""} bg-gradient-to-b from-[#FADD37] to-[#F8A900]`}
    >
      {Icon && iconPosition === "left" && (
        <Icon className={` ${iconColor}`} style={{ strokeWidth }} />
      )}
      <span className="text-md italic font-[Inter]">{text}</span>
      {Icon && iconPosition === "right" && (
        <Icon className={` ${iconColor}`} style={{ strokeWidth }} />
      )}
    </div>
  );
};

export default SecondaryButton;
