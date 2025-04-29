import { ReportTable2, SampleTable } from "../../components";

const CEA = () => {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <section className="flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="flex flex-col rounded-lg overflow-hidden shadow-sm">
            <p className="w-full bg-primary text-white text-center">
              Send Dengue Alerts
            </p>
            <div className="flex flex-col p-6">
              <div>
                {" "}
                <label>Select Barangay</label>
                {/* Dropdown of list of barangays, can also search, u can get dropdown icon from phosphor */}
                <input placeholder="Barangay" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CEA;
