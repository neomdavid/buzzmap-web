import React from "react";
import womanWithHand from "../assets/woman_withhand.png";
const About = () => {
  return (
    <main>
      <article className="relative bg-primary w-[70vw] ml-auto h-[100vh]">
        <img
          src={womanWithHand}
          className="w-140 absolute top-20 left-[-197px] "
        />
        <section className="text-white p-12">
          <div>
            <h1 className="text-8xl">
              About <span>BuzzMap</span>
            </h1>
          </div>
        </section>
      </article>
    </main>
  );
};

export default About;
