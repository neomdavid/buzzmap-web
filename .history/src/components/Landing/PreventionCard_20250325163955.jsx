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
      <div className="h-25 w-25 bg-white border-16 border-primary rounded-full absolute right-[-2px] bottom-[-4px] "></div>
    </section>
  );
};

export default PreventionCard;
