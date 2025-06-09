import womanWithHand from "../../assets/woman_withhand.png";
import MemberCard from "../../components/About/MemberCard";
import reyProfile from "../../assets/members/rey.png";
import davidProfile from "../../assets/members/david.png";
import cruzProfile from "../../assets/members/cruz.png";
import rapiProfile from "../../assets/members/rapi.png";
import logoDarkBg from "../../assets/logo_darkbg.svg";
import quezonSurveillance from "../../assets/icons/quezon_surveillance.png";

const About = () => {
  return (
    <main className="overflow-visible">
      <article className="relative bg-primary w-[100vw] md:w-[70vw] max-w-[800px] ml-auto min-h-[95vh] md:mt-0 md:pb-4">
        <img
          src={womanWithHand}
          className="w-140 absolute left-[-197px] hidden md:block bottom-[23%] lg:w-165 lg:left-[-233px] xl:w-190 xl:left-[-268px] 2xl:w-205 2xl:left-[-289px] 2xl:bottom-[19%]"
        />

        <section className="text-white p-12 font-light mb-8">
          {/* QCESD Partnership Card - At the top */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 w-[80%] mx-auto">
            <div className="flex justify-center  md:items-center gap-4 mb-6">
              <img
                src={quezonSurveillance}
                className="w-12 h-12 md:w-15 md:h-15 flex-shrink-0 object-contain"
                alt="QCESD Logo"
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
            
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Location</p>
                  <p className="text-white/85 text-sm">Quezon City Hall Compound, Diliman, QC</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Contact</p>
                  <p className="text-white/85 text-sm">(02) 8928-4242</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Email</p>
                  <p className="text-white/85 text-sm">qcesd@quezoncity.gov.ph</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Hours</p>
                  <p className="text-white/85 text-sm">Mon-Fri 8AM-5PM</p>
                </div>
              </div>
            </div> */}
            
            <p className="text-white/90 text-md text-center leading-relaxed">
              Dedicated to protecting public health through disease surveillance, outbreak investigation, and health promotion. Working to prevent and control the spread of diseases, including dengue, through community education and rapid response.
            </p>
          </div>

          <div className="text-center py-12">
            <h1 className="text-8xl font-light mb-4">
              About{" "}
              <span className="italic font-[900] tracking-wider">BuzzMap</span>
            </h1>
            <p className="max-w-[80%] mx-auto mb-10">
              <b className="font-bold">BuzzMap</b> is proud to partner with the
              Quezon City Epidemiology & Surveillance Division, specifically
              Quezon City Environmental and Sanitation Unit <b>(QC CESU)</b> in
              the fight against dengue outbreaks. Together, we aim to empower
              the community with weekly updated data, alerts, and prevention tips,
              creating a united effort to reduce the spread of dengue and
              protect public health across Quezon City.
            </p>
            <div className=" mx-auto flex flex-col gap-y-12 mb-8 sm:mb-0 gap-x-2 mx-4">
              <div className="flex-1">
                <h1 className="text-6xl mb-4">Mission</h1>
                <p className="max-w-[70%] mx-auto">
                  <b className="font-bold">
                    BuzzMap is dedicated to empowering communities through
                   dengue tracking, crowdsourced reports, and
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
                <p className="max-w-[65%] mx-auto">
                  To be the leading community-driven dengue prevention platform,
                  harnessing technology and collective action to create a safer,
                  healthier, and dengue-free future for all.
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold">Team iTech</p>
                <p className="text-xl mb-2">Developers</p>
                <p> College of Computing and Information Technology <br/>National University - Manila</p>
              </div>
            </div>
          </div>
        </section>

     
        {/* <section className="grid grid-cols-1 mt-[-40px] sm:mt-0 gap-y-4 md:gap-y-0 sm:grid-cols-2 md:grid-cols-4 justify-between md:w-[80%] ml-10 md:ml-auto pl-5 pr-15 mb-10">
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
        </section> */}

      </article>
    </main>
  );
};

export default About;
