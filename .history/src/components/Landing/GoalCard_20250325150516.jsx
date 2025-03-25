import { LockKey } from "phosphor-react";
import React from "react";

const GoalCard = () => {
  return (
    <section className="flex flex-col items-start bg-primary rounded-2xl w-full p-4">
      <div className="bg-white w-12 h-12 flex mb-3 justify-center items-center rounded-full">
        <LockKey size={24} weight="fill" />
      </div>
      <p className="text-white text-left text-xl">Confidentiality</p>
      <p className="text-white text-left text-sm">
        BuzzMap ensures that all user-reported data is kept secure and anonymous
        to protect your privacy while contributing to health efforts.
      </p>
    </section>
  );
};

export default GoalCard;
