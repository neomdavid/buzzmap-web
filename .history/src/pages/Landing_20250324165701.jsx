import patient1 from "../assets/dengue-patient-1.jpg";
const Landing = () => {
  return (
    <main className="flex flex-col">
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-[50px] px-8 mb-8">
        <h1>
          Buzzing <span className="text-accent">with awareness</span>
        </h1>
        <h1 className="text-right mt-[-28px]">
          Mapping <span className="text-accent">for Prevention!</span>
        </h1>
      </div>
      <div className="text-primary text-center font-semibold ">
        <h3 className="text-lg italic uppercase font-bold mb-2 font-[Inter]">
          Stay protected from dengue
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

      <img
        src={patient1}
        className="w-full h-auto object-cover rounded-xl mx-8 mt-[-65px]"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 60%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,1) 60%)",
        }}
      />
    </main>
  );
};

export default Landing;
