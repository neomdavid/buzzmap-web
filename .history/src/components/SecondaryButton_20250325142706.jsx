import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon,
  iconBg = "bg-white", // Default icon background color
  iconColor = "text-primary", // Default icon color
  bgColor = "bg-gradient-to-b from-[#FADD37] to-[#F8A900]", // Default button gradient
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      ${maxWidth || ""} ${bgColor}`}
    >
      {Icon && iconPosition === "left" && (
        <div className={`p-2 rounded-full ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
      <span className="text-md italic font-[Inter]">{text}</span>
      {Icon && iconPosition === "right" && (
        <div className={`p-2 rounded-full ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
    </div>
  );
};

export default SecondaryButton;
