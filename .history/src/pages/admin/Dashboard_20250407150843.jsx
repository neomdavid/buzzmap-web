const Dashboard = () => {
  return (
    <main className="flex flex-col w-full ">
      <div className="bg-primary text-white flex flex-col p-6 rounded-2xl mb-4">
        <p className="text-5xl font-[Koulen] lowercase">Hello, Jane!</p>
        <p className="text-lg">Today is Friday, 7 March 2025</p>
      </div>
      <section className="grid grid-cols-2">
        <article className="flex flex-col">
          <div className="flex flex-col bg-red-100 text-white rounded-4xl py-6 px-6">
            <p className="font-bold text-xl">Total Reports</p>
            <h1 className="text-9xl">125</h1>
          </div>
          <div className="flex flex-col bg-base-200 rounded-3xl gap-y-3 px-6 py-6 pt-15 mt-[-32px] z-[-4]">
            <div className="flex items-center gap-x-2">
              <div className="h-4 w-4 rounded-full bg-green-600" />
              <p className="text-primary">
                <span className="font-semibold">80</span> Verified
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="h-4 w-4 rounded-full bg-green-600" />
              <p className="text-primary">
                <span className="font-semibold">30</span> Pending
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="h-4 w-4 rounded-full bg-green-600" />
              <p className="text-primary">
                <span className="font-semibold">15</span> Rejected
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
