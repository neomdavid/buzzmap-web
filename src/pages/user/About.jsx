import womanWithHand from "../../assets/woman_withhand.png";
import quezonSurveillance from "../../assets/icons/quezon_surveillance.png";

const About = () => {
  return (
    <main className="overflow-hidden">
      <article className="relative bg-primary w-[100vw] md:w-[70vw] max-w-[800px] sm:ml-auto min-h-[95vh] md:mt-0 md:pb-4">
        <img
          src={womanWithHand}
          className="w-140 absolute left-[-197px] hidden md:block bottom-[23%] lg:w-165 lg:left-[-233px] xl:w-190 xl:left-[-268px] 2xl:w-205 2xl:left-[-289px] 2xl:bottom-[19%]"
          alt="BuzzMap illustration"
          width="600"
          height="640"
          loading="eager"
          fetchPriority="high"
          style={{ aspectRatio: "8/8" }}
        />

        <section className="text-white pl-6 pr-6 py-8  sm:p-12 font-light ">
          {/* QCESD Partnership Card - At the top */}
          <div className="bg-white/10 rounded-2xl p-6 shadow-lg border border-white/30 w-full sm:w-[80%] mx-auto">
            <div className="flex justify-center  md:items-center gap-4 mb-6">
              <img
                src={quezonSurveillance}
                className="w-12 h-12 md:w-15 md:h-15 flex-shrink-0 object-contain"
                alt="QCESD Logo"
                width="60"
                height="60"
                loading="eager"
              />
              <div className="">
                <p className="text-lg md:text-xl font-bold text-white leading-tight">
                  Quezon City Epidemiology & Surveillance Division
                </p>
                <p className="text-sm md:text-base text-white/90 mt-1">
                  Department of Health - Center for Health Development
                </p>
              </div>
            </div>

            <p className="text-white/90 text-md text-center leading-relaxed">
              Dedicated to protecting public health through disease
              surveillance, outbreak investigation, and health promotion.
              Working to prevent and control the spread of diseases, including
              dengue, through community education and rapid response.
            </p>
          </div>

          <div className="text-center pt-12">
            <h1 className="text-7xl sm:text-8xl font-light mb-6 sm:mb-4">
              About{" "}
              <span className="italic font-[900] tracking-wider">BuzzMap</span>
            </h1>
            <p className="max-w-full sm:max-w-[80%] mx-auto mb-10 min-h-[120px]">
              <b className="font-bold">BuzzMap</b> is proud to partner with the
              Quezon City Epidemiology & Surveillance Division, specifically
              Quezon City Environmental and Sanitation Unit <b>(QC CESU)</b> in
              the fight against dengue outbreaks. Together, we aim to empower
              the community with weekly updated data, alerts, and prevention
              tips, creating a united effort to reduce the spread of dengue and
              protect public health across Quezon City.
            </p>
            <div className=" mx-auto flex flex-col gap-y-12 mb-8 sm:mb-0 gap-x-2 mx-4">
              <div className="flex-1">
                <h1 className="text-6xl mb-4">Mission</h1>
                <p className="max-w-full sm:max-w-[70%] mx-auto">
                  <b className="font-bold">
                    BuzzMap is dedicated to empowering communities through
                    dengue tracking, crowdsourced reports, and data-driven
                    insights.
                  </b>{" "}
                  By partnering with local health agencies like QC CESU, we
                  strive to enhance public awareness, promote proactive dengue
                  prevention, and support rapid response efforts to reduce
                  outbreaks and protect lives.
                </p>
              </div>

              <div className="flex-1">
                <h1 className="text-6xl mb-4">vision</h1>
                <p className="max-w-full sm:max-w-[65%] mx-auto">
                  To be the leading community-driven dengue prevention platform,
                  harnessing technology and collective action to create a safer,
                  healthier, and dengue-free future for all.
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold">Team iTech</p>
                <p className="text-xl mb-2">Developers</p>
                <p>
                  {" "}
                  College of Computing and Information Technology <br />
                  National University - Manila
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
