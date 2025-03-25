const Landing = () => {
  return (
    <main className="flex flex-col">
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-[60px] px-8 font-normal mb-8">
        <h1>
          Buzzing <span className="text-accent">with awareness</span>
        </h1>
        <h1 className="text-right mt-[-30px]">
          Mapping <span className="text-accent">for Prevention!</span>
        </h1>
      </div>
      <div className="text-primary text-center font-semibold">
        <h3 className="text-lg uppercase font-bold mb-2">
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
    </main>
  );
};

export default Landing;
