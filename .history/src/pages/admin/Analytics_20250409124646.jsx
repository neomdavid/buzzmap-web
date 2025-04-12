const Analytics = () => {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col">
        <section className="flex flex-col">
          <p className="text-base-content text-4xl font-bold">Action Plans</p>
          <div className="flex flex-col">
            <div className="flex flex-col bg-white border-l-5 py-3 px-6 rounded-2xl">
              <p className="text-xl text-base-content font-semibold">
                Scheduled
              </p>
              <div className="flex justify-between w-full text-black  ">
                <p>Fogging in Barangay Payatas</p>
                <p>March 15</p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
};

export default Analytics;
