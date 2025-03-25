import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({ text, to, maxWidth }) => {
  return (
    <Link
      className={`text-md text-center italic font-[Inter] w-full text-primary py-3 shadow-lg rounded-xl font-semibold hover:cursor-pointer hover:scale-105 transition-scale duration-300 active:opacity-70 ${
        maxWidth ? maxWidth : ""
      }`}
      style={{
        background: "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)",
      }}
      to={to}
    >
      {text}
    </Link>
  );
};

export default SecondaryButton;
