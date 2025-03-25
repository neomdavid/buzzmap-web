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

      <div className="relative">
        <img src={patient1} className="mx-8 rounded-xl" alt="Patient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
      </div>
    </main>
  );
};

export default Landing;
