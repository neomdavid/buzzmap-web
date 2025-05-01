import { InterventionsTable, FormCoordinationRequest } from "../../components";
import { Circle, MagnifyingGlass, Lightbulb } from "phosphor-react";
const posts = [
  {
    id: 1,
    barangay: "Barangay 1",
    date: "2025-04-25T10:30:00Z", // ISO 8601 format
    interventionType: "Community Clean-up Drive",
    personnel: "John Doe",
    status: "Complete",
  },
  {
    id: 2,
    barangay: "Barangay 2",
    date: "2025-04-26T09:00:00Z",
    interventionType: "Breeding Site Inspection",
    personnel: "Jane Smith",
    status: "Scheduled",
  },
  {
    id: 3,
    barangay: "Barangay 3",
    date: "2025-04-27T08:00:00Z",
    interventionType: "Larvicide Distribution",
    personnel: "Mark Johnson",
    status: "Ongoing",
  },
  {
    id: 4,
    barangay: "Barangay 4",
    date: "2025-04-28T07:15:00Z",
    interventionType: "School Awareness Campaign",
    personnel: "Sara Lee",
    status: "Complete",
  },
  {
    id: 5,
    barangay: "Barangay 5",
    date: "2025-04-29T14:45:00Z",
    interventionType: "Drainage System Flushing",
    personnel: "David Brown",
    status: "Scheduled",
  },
];

function Interventions() {
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Interventions
      </p>
      <section className="flex flex-col gap-16">
        <div>
          <p className="text-base-content text-4xl font-bold mb-2">
            Recent Intervention Records
          </p>
          <div className="h-135">
            <InterventionsTable posts={posts} onlyRecent={true} />
          </div>
        </div>
        <div className="flex flex-col w-full gap-10">
          <div className="">
            <FormCoordinationRequest />
          </div>
          <div className="flex flex-col">
            <p className="text-base-content text-4xl font-bold mb-2">
              Recent Intervention Records
            </p>
            <div className="flex flex-col gap-2 border-2 border-error rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <p className="text-error font-extrabold text-2xl">
                  Barangay Commonwealth
                </p>
                <p className="bg-error text-white py-1 px-4 rounded-xl">
                  Immediate Action Needed
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-error">
                  <Circle weight="fill" />
                </div>
                <p className="text-error">
                  <span className="font-semibold text-black">Risk Level: </span>
                  High
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  <MagnifyingGlass />
                </div>
                <p className="text-black">
                  <span className="font-semibold">Issue Detected: </span>
                  Spike in Breeding Site & Infestation Reports
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  <MagnifyingGlass />
                </div>
                <p className="text-black">
                  <span className="font-semibold">Suggested Action: </span>
                  Fogging Operation, Breeding Site Elimination
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
export default Interventions;
