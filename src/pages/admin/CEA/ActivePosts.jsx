import { useState, useRef } from "react";
import {
  FormPublicPost,
  FormDengueAlert,
  AdminPostsTable,
  AlertsTable
} from "../../../components";
import { Plus } from "phosphor-react";

const TABS = [
  { id: "public", label: "Public Information Posts" },
  { id: "alerts", label: "Dengue Alerts" },
];

const ActivePosts = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [modalType, setModalType] = useState(null); // 'public' or 'alerts'
  const dialogRef = useRef(null);

  const openModal = (type) => {
    setModalType(type);
    setTimeout(() => {
      dialogRef.current?.showModal();
    }, 0);
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setModalType(null);
  };

  return (
    <main className="flex flex-col w-full z-10000">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[78%]">
        Community Engagement and Awareness
      </p>

      {/* Tabs - styled as bordered tabs, not filled buttons */}
      <div className="flex gap-0 mb-8 border-b-2 border-gray-200">
        {TABS.map((tab, idx) => (
          <button
            key={tab.id}
            className={`px-6 py-2 text-lg font-semibold focus:outline-none transition-colors
              border-x border-t
              ${activeTab === tab.id
                ? "border-primary border-b-white bg-white text-primary rounded-t-xl z-10"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-t-xl"
              }
              ${idx === 0 ? "-ml-px" : ""}
            `}
            style={{ marginBottom: '-2px' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Button (left-aligned, styled like Add New Intervention) */}
      <div className="mb-6 flex justify-start items-center">
        {activeTab === "public" ? (
          <button
            className="flex gap-1 bg-primary items-center rounded-2xl py-3 px-6 text-lg text-white font-semibold hover:cursor-pointer hover:bg-primary/90 transition-all duration-200"
            onClick={() => openModal("public")}
          >
            <Plus size={17} />
            Publish Post
          </button>
        ) : (
          <button
            className="flex gap-1 bg-error items-center rounded-2xl py-3 px-6 text-lg text-white font-semibold hover:cursor-pointer hover:bg-error-dark transition-all duration-200"
            onClick={() => openModal("alerts")}
          >
            <Plus size={17} />
            Send Dengue Alert
          </button>
        )}
      </div>

      {/* Table Section */}
      <section className="flex flex-col gap-36">
        <div className="mt-4 h-135">
          {activeTab === "public" ? <AdminPostsTable /> : <AlertsTable />}
        </div>
      </section>

      {/* Modal for Forms using <dialog> */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box bg-transparent shadow-none rounded-3xl w-11/12 max-w-3xl  relative">
          <button
            className="absolute top-9 right-10 z-40 text-white text-xl font-semibold hover:text-gray-500 transition-all duration-200 hover:cursor-pointer"
            onClick={closeModal}
          >
            ✕
          </button>
          {modalType === "public" && <FormPublicPost />}
          {modalType === "alerts" && <FormDengueAlert />}
        </div>
      </dialog>
    </main>
  );
};

export default ActivePosts; 