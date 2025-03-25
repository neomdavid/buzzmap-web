import patient1 from "../assets/dengue-patient-1.jpg";
import { Heading, SecondaryButton } from "../components";
const Landing = () => {
  return (
    <main className="flex flex-col">
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-7xl px-8 mb-6">
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
      <div className="w-[80%] m-auto mt-2 flex gap-x-3">
        <SecondaryButton text={"Check Dengue Hotspots"} />
        <SecondaryButton text={"Report a Dengue Case"} />
        <SecondaryButton text={"Get Prevention Tips"} />
      </div>

      <img
        src={patient1}
        className="h-[380PX] object-cover rounded-xl mx-6 mt-[-55px] z-[-1] mb-6"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 60%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,1) 60%)",
        }}
      />

      <section className="flex flex-wrap mx-6 justify-center">
        <div className="w-140 h-160 bg-accent">hello</div>
        <div className="flex flex-col flex-1 text-right mx-6 max-w-4xl">
          <Heading text="see the /danger zones/" />
          <p className="text-primary text-xl font-semibold">
            By tracking and visualizing dengue hotspots, users can stay
            informed, take preventive actions, and avoid high-risk areas,
            ultimately reducing their chances of exposure and contributing to
            the fight against dengue.
          </p>
          <br />
          <p className="text-primary text-md">
            BuzzMap’s dengue mapping feature uses real-time crowdsourced data to
            track and visualize dengue outbreaks in your area. Users report
            dengue cases and mosquito breeding sites, which are then plotted on
            an interactive map. This helps the community stay informed, identify
            hotspots, and take proactive steps to prevent the spread of dengue.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Landing;
