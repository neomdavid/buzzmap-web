import patient1 from "../assets/dengue-patient-1.jpg";
import { SecondaryButton } from "../components";
const Landing = () => {
  return (
    <main className="flex flex-col">
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-[50px] px-8 mb-6">
        <h1>
          Buzzing <span className="text-accent">with awareness</span>
        </h1>
        <h1 className="text-right mt-[-28px]">
          Mapping <span className="text-accent">for Prevention!</span>
        </h1>
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
        className="h-[380PX] object-cover rounded-xl mx-6 mt-[-55px] z-[-1]"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 60%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,1) 60%)",
        }}
      />

      <h1>
        Buzzing <span className="text-accent text-3xl">with awareness</span>
      </h1>
    </main>
  );
};

export default Landing;
