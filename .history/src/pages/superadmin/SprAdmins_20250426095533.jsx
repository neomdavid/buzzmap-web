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
        <div className="modal-box w-7/12 max-w-5xl py-10">
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </main>
  );
}

export default SprAdmins;
