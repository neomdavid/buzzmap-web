import React from "react";
import womanWithHand from "../assets/woman_withhand.png";
import MemberCard from "../components/About/MemberCard";
import reyProfile from "../assets/members/rey.png";
import davidProfile from "../assets/members/david.png";
import cruzProfile from "../assets/members/cruz.png";
import rapiProfile from "../assets/members/rapi.png";
import logoDarkBg from "../assets/logo_darkbg.svg";

const About = () => {
  return (
    <main>
      <article className="relative bg-primary w-[70vw] max-w-[1000px] ml-auto min-h-[93vh] overflow-visible">
        {/* Woman Image - Kept Outside Overflow-Hidden */}
        <img
          src={womanWithHand}
          className="w-140 absolute left-[-197px] pointer-events-none"
          style={{ bottom: "min(20vw, 300px)" }}
        />

        <section className="text-white p-12 font-light mb-8">
          <div className="text-center">
            <h1 className="text-7xl font-light mb-4">
              About{" "}
              <span className="italic font-[900] tracking-wider">BuzzMap</span>
            </h1>
            <p className="max-w-[80%] mx-auto mb-10">
              <b className="font-bold">BuzzMap</b> is proud to partner with the
              Quezon City Epidemiology & Surveillance Division...
            </p>
          </div>
        </section>

        {/* Members Section */}
        <section className="grid grid-cols-4 justify-between w-[80%] ml-auto pl-5 pr-15 mb-10">
          <MemberCard
            name="Zophia Rey"
            role="Project Manager"
            imgProfile={reyProfile}
            rotate="rotate-12"
            translateY="translate-y-8"
          />
          <MemberCard
            name="Neo David"
            role="Programmer"
            imgProfile={davidProfile}
            rotate="-rotate-12"
            translateY="-translate-y-8"
          />
          <MemberCard
            name="Tyrel Cruz"
            role="System Analyst"
            imgProfile={cruzProfile}
            rotate="rotate-12"
            translateY="translate-y-16"
          />
          <MemberCard
            name="Russel Rapi"
            role="Technical Writer"
            imgProfile={rapiProfile}
            rotate="-rotate-12"
            translateY="-translate-y-20"
          />
        </section>

        {/* Meet The Team Section */}
        <section className="w-[90%] flex relative justify-between mx-auto overflow-hidden">
          <h1 className="text-left -translate-y-15 text-6xl bg-red-100 tracking-wide">
            Meet <br /> the <br /> team
          </h1>
          {/* Logo - Hidden Overflow */}
          <div className="relative w-[35%] max-w-[300px]">
            <img
              src={logoDarkBg}
              className="absolute right-[-50px] bottom-[-10vw] rotate-45"
            />
          </div>
        </section>
      </article>
    </main>
  );
};

export default About;
