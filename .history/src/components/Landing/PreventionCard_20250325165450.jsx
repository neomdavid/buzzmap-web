import { CaretRight } from "phosphor-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const PreventionCard = ({ title, category, bgImg, to }) => {
  const navigate = useNavigate();

  return (
    <section className="min-w-[200px] h-[290px] relative  ">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center rounded-[37px] mix-blend-luminosity"
        style={{ backgroundImage: `url(${bgImg})` }}
      ></div>

      {/* Content */}
      <p className="text-3xl text-white absolute bottom-9 left-5 leading-7.5 font-bold w-[100px]">
        {title}
      </p>
      <p className="text-xs font-normal p-2 px-4 rounded-full italic absolute bottom-41 left-5 leading-7.5 font-bold text-primary bg-white">
        {category}
      </p>

      {/* Circle with Icon (Navigates to `to` prop) */}
      <div
        className="h-27 w-27 bg-white border-18 border-primary rounded-full absolute right-[-18px] bottom-[-13px] flex items-center justify-center cursor-pointer"
        onClick={() => navigate(to)}
      >
        <CaretRight size={24} weight="bold" />
      </div>
    </section>
  );
};

export default PreventionCard;
