import React from "react";
import womanWithHand from "../assets/woman_withhand.png";
const About = () => {
  return (
    <main>
      <article className="relative bg-primary w-[70vw] ml-auto h-[100vh]">
        <img
          src={womanWithHand}
          className="w-140 absolute bottom-50 left-[-197px] "
        />
        <section className="text-white p-12">
          <div className="text-center">
            <h1 className="text-7xl font-light">
              About{" "}
              <span className="italic font-[900] tracking-wider">BuzzMap</span>
            </h1>
            <p className="max-w-[80%] mx-auto mb-10">
              BuzzMap is proud to partner with the Quezon City Epidemiology &
              Surveillance Division, specifically Quezon City Environmental and
              Sanitation Unit (QC CESU) in the fight against dengue outbreaks.
              Together, we aim to empower the community with real-time data,
              alerts, and prevention tips, creating a united effort to reduce
              the spread of dengue and protect public health across Quezon City.
            </p>
            <div className="flex">
              <div className="">
                <h1 className="text-6xl">Mission</h1>
                <p>
                  BuzzMap is dedicated to empowering communities through
                  real-time dengue tracking, crowdsourced reports, and
                  data-driven insights. By partnering with local health agencies
                  like QC CESU, we strive to enhance public awareness, promote
                  proactive dengue prevention, and support rapid response
                  efforts to reduce outbreaks and protect lives.
                </p>
              </div>

              <div className="">
                <h1 className="text-6xl">Mission</h1>
                <p>
                  BuzzMap is dedicated to empowering communities through
                  real-time dengue tracking, crowdsourced reports, and
                  data-driven insights. By partnering with local health agencies
                  like QC CESU, we strive to enhance public awareness, promote
                  proactive dengue prevention, and support rapid response
                  efforts to reduce outbreaks and protect lives.
                </p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
};

export default About;
