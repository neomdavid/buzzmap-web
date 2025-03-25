import { LockKey } from "phosphor-react";
import React from "react";

const GoalCard = () => {
  return (
    <section className="flex flex-col bg-primary rounded-2xl">
      <div className="bg-white w-12 h-12 flex justify-center items-center rounded-full">
        <LockKey size={28} weight="fill" />
      </div>
      <p>Confidentiality</p>
    </section>
  );
};

export default GoalCard;
