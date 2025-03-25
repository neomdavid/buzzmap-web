import patient1 from "../assets/dengue-patient-1.jpg";
import tubImg from "../assets/mosquito_tub.jpg";

import {
  GoalCard,
  Heading,
  PreventionCard,
  SecondaryButton,
} from "../components";
import {
  ArrowRight,
  LockKey,
  HandPointing,
  UsersThree,
  Bug,
  ShieldCheck,
} from "phosphor-react";
import ScrambledText from "../components/Landing/ScrambledText";
import AltPreventionCard from "../components/Landing/AltPreventionCard";

const Landing = () => {
  return (
    <main className="flex flex-col pb-100">
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-7xl px-8 mb-10">
        <Heading text="Buzzing /with awareness/" />
        <Heading className="text-right" text="Mapping /for prevention/" />
      </div>
      <div className="text-primary text-center font-semibold mb-8">
        <h3 className="text-xl italic uppercase font-bold mb-2 font-[Inter]">
          Stay protected from dengue.
        </h3>
        <p>
          Join the community in&nbsp;
          <span className="font-bold italic">
            mapping dengue hotspots, sharing reports,
          </span>{" "}
          and&nbsp;
          <span className="font-bold italic">
            preventing outbreaks together.
          </span>
        </p>
      </div>
      <div className="w-[80%] m-auto mt-2 flex gap-x-3 justify-center">
        <SecondaryButton text={"Check Dengue Hotspots"} />
        <SecondaryButton text={"Report a Dengue Case"} />
        <SecondaryButton text={"Get Prevention Tips"} />
      </div>

      <img
        src={patient1}
        className="h-[380PX] object-cover rounded-xl mx-6 mt-[-60px] z-[-1] mb-8"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 60%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,1) 60%)",
        }}
      />

      <section className="flex  mx-4 justify-center">
        <div className="flex-8 h-auto bg-accent">hello</div>
        <div className="flex flex-col flex-10 text-right mx-6  items-end">
          <Heading text="see the /danger zones/" />
          <p className="text-primary text-xl font-semibold mt-5">
            By tracking and visualizing dengue hotspots, users can stay
            informed, take preventive actions, and avoid high-risk areas,
            ultimately reducing their chances of exposure and contributing to
            the fight against dengue.
          </p>
          <br />
          <p className="text-primary text-md mb-6">
            BuzzMap’s dengue mapping feature uses real-time crowdsourced data to
            track and visualize dengue outbreaks in your area. Users report
            dengue cases and mosquito breeding sites, which are then plotted on
            an interactive map. This helps the community stay informed, identify
            hotspots, and take proactive steps to prevent the spread of dengue.
          </p>
          <SecondaryButton
            text="Explore the Dengue Map"
            maxWidth={"max-w-[230px]"}
            Icon={ArrowRight}
          />
          <div className="flex justify-around gap-x-4 w-full mt-8">
            <GoalCard
              Icon={LockKey}
              title="Confidentiality"
              text="BuzzMap ensures that all user-reported data is kept secure and anonymous to protect your privacy while contributing to health efforts."
              bgColor="bg-primary"
            />
            <GoalCard
              Icon={HandPointing}
              title="Accessibility"
              text="User-friendly and accessible on both mobile and desktop, ensuring everyone can contribute to dengue prevention."
              bgColor="light"
            />
            <GoalCard
              Icon={UsersThree}
              title="Community"
              text="Users can share information, support each other, and work together to combat dengue outbreaks."
              bgColor="bg-primary"
            />
          </div>
        </div>
      </section>
      <article className="bg-primary mt-6 flex flex-col items-center py-10">
        <h1 className="uppercase text-6xl text-white">DON'T WAIT FOR AN</h1>
        <ScrambledText text="outbreak!" />
        <p className="italic text-white mt-8 mb-8">
          Take Action with These Prevention Tips
        </p>
        <div className="flex gap-6">
          <PreventionCard
            title="Eliminate Mosquito Breeding Sites"
            category="Control and Sanitation"
            bgImg={tubImg}
            to="/prevention/details"
          />
          <AltPreventionCard
            title="Avoid Stagnant Water"
            subtext="Prevent mosquitoes from laying eggs."
            category="Sanitation"
            Icon={ShieldCheck} // Phosphor Icon
            iconSize={115} // Adjust icon size
            iconPosition="top-[-15px] right-[-20px]" // Move icon anywhere
            iconRotation={-15} // Rotate icon
            titlePosition="bottom-16 left-5" // Move title anywhere
            subtextPosition="bottom-10 left-5" // Move subtext anywhere
            categoryPosition="top-5 left-5" // Move category anywhere
            bgColor="bg-secondary" // Now supports Tailwind classes
            to="/sanitation"
          />
        </div>
      </article>
    </main>
  );
};

export default Landing;
