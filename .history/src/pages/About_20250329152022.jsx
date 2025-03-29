import React from "react";
import womanWithHand from "../assets/woman_withhand.png";
const About = () => {
  return (
    <main>
      <article className="relative">
        <img src={womanWithHand} className="absolute" />
      </article>
    </main>
  );
};

export default About;
