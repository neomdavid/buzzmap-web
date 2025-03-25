import { LockKey } from "phosphor-react";
import React from "react";

const GoalCard = () => {
  return (
    <section className="flex flex-col bg-primary">
      <div className="bg-white">
        <LockKey size={28} weight="fill" />
      </div>
    </section>
  );
};

export default GoalCard;
