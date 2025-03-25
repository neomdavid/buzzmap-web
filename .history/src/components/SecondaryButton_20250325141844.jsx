import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as RightArrow } from "../assets/icons/arrow-narrow-right.svg";

const SecondaryButton = ({ text, to, maxWidth, icon }) => {
  return (
    <div className="flex p-6 justify-between text-primary  shadow-lg rounded-xl font-semibold hover:cursor-pointer hover:scale-105 transition-scale duration-300 active:opacity-70">
      <Link
        className={`text-md text-center italic font-[Inter]  ${
          maxWidth ? maxWidth : ""
        }`}
        style={{
          background: "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)",
        }}
        to={to}
      >
        {text}
      </Link>
      {icon ? <RightArrow /> : ""}
    </div>
  );
};

export default SecondaryButton;
