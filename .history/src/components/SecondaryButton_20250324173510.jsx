import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({ text, to }) => {
  return (
    <Link
      className="text-md text-center italic font-[Inter] w-full text-primary py-3 shadow-2xl rounded-xl font-semibold hover:cursor-pointer hover:scale-105 transition-scale duration-300 active:opacity-70"
      style={{
        background: "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)",
      }}
    >
      {text}
    </Link>
  );
};

export default SecondaryButton;
