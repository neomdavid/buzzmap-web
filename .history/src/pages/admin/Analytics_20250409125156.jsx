const Analytics = () => {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col">
        <section className="flex flex-col">
          <p className="text-base-content text-4xl font-bold mb-4">
            Action Plans
          </p>
          <div className="flex flex-col">
            <div className="flex flex-col gap-y-2 bg-white border-l-7 py-4 px-6 rounded-2xl shadow-sm">
              <p className="text-xl text-base-content font-semibold mb-1">
                Scheduled
              </p>
              <div className="flex justify-between text-lg w-full text-black text-md  ">
                <p>Fogging in Barangay Payatas</p>
                <p className="text-base-content font-bold">March 15</p>
              </div>
              <div className="flex justify-between w-full text-black text-md  ">
                <p>Awareness Seminar in Barangay Holy Spirit</p>
                <p className="text-base-content font-bold">March 20</p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
};

export default Analytics;
