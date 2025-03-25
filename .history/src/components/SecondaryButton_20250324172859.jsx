import React from "react";

const SecondaryButton = () => {
  return (
    <button
      className="text-lg italic font-[Inter] w-full text-primary py-2 rounded-lg font-semibold hover:cursor-pointer hover:scale-105 transition-scale duration-300 active:opacity-70"
      style={{
        background: "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)",
      }}
    >
      Secondary
    </button>
  );
};

export default SecondaryButton;
