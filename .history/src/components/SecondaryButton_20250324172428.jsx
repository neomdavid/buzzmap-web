import React from "react";

const SecondaryButton = () => {
  return (
    <button
      className="text-lg italic font-[Inter] w-full text-primary py-2 rounded-lg font-semibold hover:cursor-pointer transition-all duration-300"
      style={{
        background: "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)",
      }}
      onMouseEnter={(e) => {
        e.target.style.background =
          "linear-gradient(to bottom, #e6c831 10%, #e09300 100%)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background =
          "linear-gradient(to bottom, #FADD37 10%, #F8A900 100%)";
      }}
    >
      Secondary
    </button>
  );
};

export default SecondaryButton;
