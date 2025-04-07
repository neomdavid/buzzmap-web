const Dashboard = () => {
  return (
    <main className="flex flex-col w-full ">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>
      <section className="grid grid-cols-2">
        <article className="flex flex-col">
          <div className="flex flex-col bg-red-100 text-white rounded-lg py-4 px-6">
            <p>Total Reports</p>
            <h1 className="text-8xl">125</h1>
          </div>
          <div className="flex flex-col bg-base-200 rounded-3xl"></div>
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
