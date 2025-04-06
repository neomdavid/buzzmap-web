import womanWithHand from "../../assets/woman_withhand.png";
import MemberCard from "../../components/About/MemberCard";
import reyProfile from "../../assets/members/rey.png";
import davidProfile from "../../assets/members/david.png";
import cruzProfile from "../../assets/members/cruz.png";
import rapiProfile from "../../assets/members/rapi.png";
import logoDarkBg from "../../assets/logo_darkbg.svg";

const About = () => {
  return (
    <main className="overflow-clip">
      <article className="relative bg-primary w-[100vw] md:w-[70vw] max-w-[1000px] ml-auto min-h-[93vh] overflow-y-clip md:pb-4">
        <img
          src={womanWithHand}
          className="w-140 absolute left-[-197px] hidden md:block bottom-[23%] lg:w-165 lg:left-[-233px] xl:w-190 xl:left-[-268px] 2xl:w-205 2xl:left-[-289px] 2xl:bottom-[19%]"
        />

        <section className="text-white p-12 font-light mb-8">
          <div className="text-center">
            <h1 className="text-7xl font-light mb-4">
              About{" "}
              <span className="italic font-[900] tracking-wider">BuzzMap</span>
            </h1>
            <p className="max-w-[80%] mx-auto mb-10">
              <b className="font-bold">BuzzMap</b> is proud to partner with the
              Quezon City Epidemiology & Surveillance Division, specifically
              Quezon City Environmental and Sanitation Unit <b>(QC CESU)</b> in
              the fight against dengue outbreaks. Together, we aim to empower
              the community with real-time data, alerts, and prevention tips,
              creating a united effort to reduce the spread of dengue and
              protect public health across Quezon City.
            </p>
            <div className="flex flex-col sm:flex-row gap-y-12 mb-8 sm:mb-0 gap-x-2 mx-4">
              <div className="flex-1">
                <h1 className="text-6xl mb-4">Mission</h1>
                <p>
                  <b className="font-bold">
                    BuzzMap is dedicated to empowering communities through
                    real-time dengue tracking, crowdsourced reports, and
                    data-driven insights.
                  </b>{" "}
                  By partnering with local health agencies like QC CESU, we
                  strive to enhance public awareness, promote proactive dengue
                  prevention, and support rapid response efforts to reduce
                  outbreaks and protect lives.
                </p>
              </div>

              <div className="flex-1">
                <h1 className="text-6xl mb-4">vision</h1>
                <p>
                  To be the leading community-driven dengue prevention platform,
                  harnessing technology and collective action to create a safer,
                  healthier, and dengue-free future for all.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 mt-[-40px] sm:mt-0 gap-y-4 md:gap-y-0 sm:grid-cols-2 md:grid-cols-4 justify-between md:w-[80%] ml-10 md:ml-auto pl-5 pr-15 mb-10">
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
            translateY="-translate-y-11"
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
        <section className="w-full flex relative h-35 justify-between ml-10  ">
          <h1 className="text-left -translate-y-15 text-6xl  text-white tracking-wide lg:text-7xl lg:ml-5">
            Meet <br /> the <br /> team
          </h1>

          <div className="relative w-[200px]">
            <img
              src={logoDarkBg}
              className="absolute right-[-35px] sm:right-0 -translate-y-15 w-[45vw] sm:w-[25vw] max-w-[220px] rotate-45 z-[1]"
            />
          </div>
        </section>
      </article>
    </main>
  );
};

export default About;
