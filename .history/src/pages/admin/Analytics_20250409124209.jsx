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
            <details className="bg-white border-l-3"></details>
          </div>
        </section>
      </article>
    </main>
  );
};

export default Analytics;
