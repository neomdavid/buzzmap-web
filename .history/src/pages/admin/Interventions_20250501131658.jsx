import { InterventionsTable } from "../../components";
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
      <p className="flex justify-center text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] ">
        Interventions
      </p>
      <div className="h-100 w-100">
        <InterventionsTable posts={posts} />
      </div>
    </main>
  );
}
export default Interventions;
