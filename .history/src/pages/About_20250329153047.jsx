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
          <div className="text-center">
            <h1 className="text-7xl">
              About{" "}
              <span className="italic font-extrabold leading-1">BuzzMap</span>
            </h1>
          </div>
        </section>
      </article>
    </main>
  );
};

export default About;
