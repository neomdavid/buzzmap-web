import React from "react";
import womanWithHand from "../assets/woman_withhand.png";
const About = () => {
  return (
    <main>
      <article className="relative bg-primary w-[70vw] ml-auto">
        <img
          src={womanWithHand}
          className="w-140 absolute top-20 left-[-20px] "
        />
        hello
      </article>
    </main>
  );
};

export default About;
