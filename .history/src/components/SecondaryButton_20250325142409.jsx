import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon,
  iconPosition = "right",
}) => {
  return (
    <Link
      to={to}
      style={{
        background: "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)",
      }}
      className={`flex items-center gap-2 p-4 px-8 justify-center text-primary shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 ${
        maxWidth || ""
      }`}
    >
      {Icon && iconPosition === "left" && <Icon className="" />}
      <span className="text-md italic font-[Inter]">{text}</span>
      {Icon && iconPosition === "right" && <Icon className="" />}
    </Link>
  );
};

export default SecondaryButton;
