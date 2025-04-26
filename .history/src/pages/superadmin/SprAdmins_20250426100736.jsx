import { AdminsTable } from "../../components";
import { IconPlus } from "@tabler/icons-react";

function SprAdmins() {
  return (
    <main className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-5xl font-extrabold text-center md:text-left">
          Admin Management
        </h1>

        <button className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm md:w-auto w-full">
          <IconPlus size={20} />
          Create an Admin
        </button>
      </div>

      <div className="h-[calc(100vh-200px)] bg-white rounded-xl shadow-sm p-4">
        <AdminsTable />
      </div>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() => document.getElementById("my_modal_4").showModal()}
      >
        open modal
      </button>
      <dialog id="my_modal_4" className="modal">
        <div className="modal-box gap-6 text-lg w-7/12 max-w-5xl p-16 rounded-3xl flex flex-col">
          <p className="text-center text-3xl font-bold mb-12">
            Create New Admin
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-primary font-semibold">First Name</label>
              <input className="p-3 bg-base-200 text-primary rounded-3xl border-none" />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-primary font-semibold">Last Name</label>
              <input className="p-3 bg-base-200 text-primary rounded-3xl border-none" />
            </div>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label className="text-primary font-semibold">Email</label>
            <input className="p-3 bg-base-200 text-primary rounded-3xl border-none" />
          </div>
          <div className="flex flex-col">
            <div className="w-full flex flex-col gap-1">
              <label className="text-primary font-semibold">Password</label>
              <input className="p-3 bg-base-200 text-primary rounded-3xl border-none" />
            </div>
            {/* only show up for validation */}
            <p className="text-[12px] italic">
              Password must be At least 8 characters long, contains both
              uppercase and lowercase letters, includes at least one number, and
              contains one special character (e.g., !, @, #, $)
            </p>
          </div>
          <div className="flex flex-col">
            <div className="w-full flex flex-col gap-1">
              <label className="text-primary font-semibold">
                Confirm Password
              </label>
              <input className="p-3 bg-base-200 text-primary rounded-3xl border-none" />
            </div>
            {/* only show up for validation */}
            <p className="text-[12px] italic">{/* proper validation */}</p>
          </div>
        </div>
      </dialog>
    </main>
  );
}

export default SprAdmins;
