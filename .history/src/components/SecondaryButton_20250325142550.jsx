import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon,
  iconColor = "text-secondary", // Default icon color
  bgColor = "text-primary", // Default gradient
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      ${maxWidth || ""} ${bgColor}`}
    >
      {Icon && iconPosition === "left" && <Icon className={` ${iconColor}`} />}
      <span className="text-md italic font-[Inter]">{text}</span>
      {Icon && iconPosition === "right" && <Icon className={` ${iconColor}`} />}
    </div>
  );
};

export default SecondaryButton;
