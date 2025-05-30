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
            <h1 className="text-7xl font-light">
              About{" "}
              <span className="italic font-[900] tracking-wider">BuzzMap</span>
            </h1>
            <p className="max-w-[60%]">
              BuzzMap is proud to partner with the Quezon City Epidemiology &
              Surveillance Division, specifically Quezon City Environmental and
              Sanitation Unit (QC CESU) in the fight against dengue outbreaks.
              Together, we aim to empower the community with real-time data,
              alerts, and prevention tips, creating a united effort to reduce
              the spread of dengue and protect public health across Quezon City.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
};

export default About;
