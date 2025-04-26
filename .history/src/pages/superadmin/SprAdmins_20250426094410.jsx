import { AdminsTable } from "../../components";
function SprAdmins() {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Admin Management
      </p>
      <div className="h-[50vh]">
        <AdminsTable />
      </div>
    </main>
  );
}

export default SprAdmins;
