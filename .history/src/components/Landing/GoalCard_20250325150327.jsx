import { LockKey } from "phosphor-react";
import React from "react";

const GoalCard = () => {
  return (
    <section className="flex flex-col items-start bg-primary rounded-2xl w-full p-4">
      <div className="bg-white w-12 h-12 flex mb-4 justify-center items-center rounded-full">
        <LockKey size={22} weight="fill" />
      </div>
      <p>Confidentiality</p>
    </section>
  );
};

export default GoalCard;
