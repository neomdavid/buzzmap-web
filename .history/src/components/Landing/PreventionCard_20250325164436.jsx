import { CaretRight } from "phosphor-react";
import React from "react";

const PreventionCard = () => {
  return (
    <section className="min-w-[200px] h-[290px] relative rounded-[37px] bg-red-100">
      <p className="text-3xl absolute bottom-9 left-5 leading-7.5 font-bold text-primary w-[100px] bg-red-100">
        Eliminate Mosquito Breeding Sites
      </p>
      <p className="text-xs font-normal p-2 px-4 rounded-full italic absolute bottom-41 left-5 leading-7.5 font-bold text-primary  bg-white">
        Control and Sanitation
      </p>
      <div className="h-27 w-27 bg-white border-18 border-primary rounded-full absolute right-[-17px] bottom-[-12px] flex items-center justify-center">
        <CaretRight size={24} weight="bold" />
      </div>
    </section>
  );
};

export default PreventionCard;
