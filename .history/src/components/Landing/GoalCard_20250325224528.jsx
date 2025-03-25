import React from "react";

const GoalCard = ({ Icon, title, text, bgColor }) => {
  return (
    <section
      className={`flex flex-col items-center text-center sm:items-start rounded-xl w-full p-5 ${
        bgColor === "light" ? "bg-base-200" : "bg-primary"
      }`}
    >
      <div
        className={`${
          bgColor === "light" ? "bg-primary" : "bg-white"
        } w-13 h-13 flex mb-3 justify-center items-center rounded-full`}
      >
        {Icon && (
          <Icon
            size={24}
            weight="fill"
            className={bgColor === "light" ? "text-white" : "text-primary"}
          />
        )}
      </div>
      <p
        className={`${
          bgColor === "light" ? "text-primary" : "text-white"
        }  text-left text-lg mb-2`}
      >
        {title}
      </p>
      <p
        className={`${
          bgColor === "light" ? "text-primary" : "text-white"
        }  text-left text-sm font-light`}
      >
        {text}
      </p>
    </section>
  );
};

export default GoalCard;
