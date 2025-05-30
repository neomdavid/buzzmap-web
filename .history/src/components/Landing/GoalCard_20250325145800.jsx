import { LockKey } from "phosphor-react";
import React from "react";

const GoalCard = () => {
  return (
    <section className="flex flex-col bg-primary w-full">
      <div className="bg-white">
        <LockKey size={28} />
      </div>
    </section>
  );
};

export default GoalCard;
