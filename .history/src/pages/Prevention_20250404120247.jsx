import { Heading, PreventionCard, AltPreventionCard } from "../components";
import sprayingAlcohol from "../assets/sprayingalcohol.jpg";
import tubImg from "../assets/mosquito_tub.jpg";
import cleaningImg from "../assets/cleaning.jpg";
import { ShieldCheck, Heartbeat } from "phosphor-react";
const Prevention = () => {
  return (
    <main className="flex flex-col text-center items-center justify-center mt-2 py-8 overflow-x-hidden">
      <div className="mx-4">
        <Heading text="Stay one step /ahead/" className="text-8xl mb-4" />
        <p className="font-semibold text-xl">
          Read and View Smart Tips to Prevent Dengue and Protect Your Community
          Below
        </p>
      </div>

      <div className="relative w-[112%] rounded-tl-[450px] rounded-tr-[450px] mt-8 overflow-hidden">
        {/* Image */}
        <img className="w-full h-150 object-cover" src={sprayingAlcohol} />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/2 to-transparent"></div>
      </div>
      <section className="px-6 py-14 pt-24 w-full bg-primary flex flex-col text-white items-start">
        <p className="font-bold italic text-3xl w-full text-center mb-8">
          Trending Articles
        </p>
        <div className="grid grid-cols-2 m-auto md:flex justify-center flex-wrap gap-6 px-4">
          <PreventionCard
            title="Eliminate Mosquito Breeding Sites"
            category="Control and Sanitation"
            bgImg={tubImg}
            to="/prevention/details"
          />
          <AltPreventionCard
            title="Personal Protection Measures"
            subtext="Using repellents, wearing protective clothing, and installing mosquito screens."
            category="Sanitation"
            Icon={ShieldCheck}
            iconSize={115}
            iconPosition="top-[-15px] right-[-20px]"
            iconRotation={-15}
            titlePosition="top-30 left-8 lg:top-37 lg:left-10"
            subtextPosition="top-57 left-8 lg:top-67 lg:left-12.5"
            categoryPosition="top-20 left-8 lg:top-26 lg:left-12.5"
            bgColor="bg-secondary"
            to="/sanitation"
          />
          <AltPreventionCard
            title="Recognizing Dengue Symptoms Early"
            subtext="Common signs of dengue and when to seek medical help."
            category="Awareness & Detection"
            Icon={Heartbeat}
            iconSize={115}
            iconPosition="bottom-[-30px] left-5"
            iconRotation={-15}
            titlePosition="top-18 left-0 lg:top-24.5"
            subtextPosition="top-53 left-9.5 lg:top-63.5  lg:left-18"
            categoryPosition="top-6 left-[40px] lg:left-21.5 lg:top-13.5"
            bgColor="bg-base-200"
            to="/sanitation"
            titleAlign="center"
            subtextAlign="center"
          />
          <PreventionCard
            title="Community Efforts to Prevent Dengue"
            category="Community"
            bgImg={cleaningImg}
            to="/prevention/details"
          />
        </div>
        <div className="bg-white"></div>
      </section>
    </main>
  );
};

export default Prevention;
