import { ReportTable2, SampleTable } from "../../components";

const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <section className="flex flex-col text-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <form className="flex flex-col rounded-lg overflow-hidden shadow-sm">
            <p className="w-full bg-primary text-white text-center">
              Send Dengue Alerts
            </p>
            <div className="flex flex-col gap-2 p-6">
              <div className="flex gap-2">
                <label>Select Barangay</label>
                {/* Dropdown of list of barangays, can also search, u can get dropdown icon from phosphor */}
                <input placeholder="Barangay" />
              </div>
              <div className="flex flex-col gap-2">
                <label>Alert Messages</label>
                {/* Dropdown of list of barangays, can also search, u can get dropdown icon from phosphor */}
                <input placeholder="Type your message here" />
              </div>
              <div className="flex flex-col gap-2">
                <label>Schedule Alert</label>
                {/*date picker*/}
                <input placeholder="Pick date and time" />
              </div>
              <div className="w-full flex justify-center mt-4">
                <button className="bg-primary rounded-3xl font-bold text-white py-1 px-7">
                  Send Alert
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default CEA;
