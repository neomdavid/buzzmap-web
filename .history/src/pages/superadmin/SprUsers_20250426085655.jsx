import { UsersTable } from "../../components";
function SprUsers() {
  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        User Management
      </p>
      <div className="h-[50vh]">
        <UsersTable />
      </div>
    </main>
  );
}

export default SprUsers;
