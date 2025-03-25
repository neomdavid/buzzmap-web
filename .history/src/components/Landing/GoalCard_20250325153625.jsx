import React from "react";

const GoalCard = ({ Icon, title, text, bgColor }) => {
  return (
    <section
      className={`flex flex-col items-start rounded-xl w-full p-6 ${
        bgColor === "light" ? "bg-base-200" : "bg-primary"
      }`}
    >
      <div
        className={`${
          bgColor === "light" ? "bg-primary" : "bg-white"
        } w-13 h-13 flex mb-3 justify-center items-center rounded-full`}
      >
        {Icon && <Icon size={24} weight="fill" color="red" />}
      </div>
      <p className="text-white text-left text-lg mb-2">{title}</p>
      <p className="text-white text-left text-sm font-light">{text}</p>
    </section>
  );
};

export default GoalCard;
