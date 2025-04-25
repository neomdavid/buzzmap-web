import { CaretRight } from "phosphor-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const PreventionCard = ({ title, category, bgImg, to }) => {
  const navigate = useNavigate();

  return (
    <section className=" relative min-w-[200px] h-[290px] lg:min-w-[250px] lg:h-[340px] xl:h-[400px] xl:min-w-[300px] 2xl:min-w-[320px] 2xl:min-h-[450px] ">
      <div
        className="absolute inset-0 bg-cover rounded-[37px] bg-center mix-blend-luminosity"
        style={{ backgroundImage: `url(${bgImg})` }}
      ></div>

      <p className="text-3xl lg:text-4xl text-white absolute bottom-9 left-5 leading-7.5 font-bold w-[100px] lg:w-[140px] lg:leading-8.5 xl:text-[40px] xl:leading-11.5 xl:w-[180px]">
        {title}
      </p>
      <p className="text-xs font-normal p-2 px-4 rounded-full italic absolute bottom-41 lg:bottom-46 xl:bottom-57.5 xl:text-[11px]  left-5 leading-7.5 font-bold text-primary bg-white">
        {category}
      </p>

      <div
        className="h-27 w-27 bg-white border-18 border-primary rounded-full absolute right-[-18px] bottom-[-13px] flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 hover:bg-primary hover:border-white"
        onClick={() => navigate(to)}
      >
        <CaretRight
          size={24}
          weight="bold"
          className="text-primary hover:text-white transition-colors duration-300"
        />
      </div>
    </section>
  );
};

export default PreventionCard;
