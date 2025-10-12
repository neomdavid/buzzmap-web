import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  FormPublicPost,
  FormDengueAlert,
  AdminPostsTable,
  AlertsTable,
} from "../../../components";
import { Plus, Info, Clock } from "phosphor-react";

const TABS = [
  { id: "public", label: "Public Information Posts" },
  { id: "alerts", label: "Dengue Alerts" },
];

const ActivePosts = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("public");
  const [modalType, setModalType] = useState(null); // 'public' or 'alerts'
  const dialogRef = useRef(null);
  const [showAlertGuide, setShowAlertGuide] = useState(false);

  // Cooldown state
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);

  // Sync initial tab from query string (?tab=alerts|public)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "alerts" || tab === "public") {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Cooldown timer effect
  useEffect(() => {
    let interval;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setIsOnCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTime]);

  const openModal = (type) => {
    // Check if on cooldown for alerts
    if (type === "alerts" && isOnCooldown) {
      return;
    }

    setModalType(type);
    setTimeout(() => {
      dialogRef.current?.showModal();
    }, 0);
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setModalType(null);
  };

  const handleAlertSuccess = () => {
    // Close modal first
    closeModal();

    // Start cooldown timer (60 seconds) after a short delay
    setTimeout(() => {
      setIsOnCooldown(true);
      setCooldownTime(60);
    }, 100);
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
            className={`px-6 py-2 text-lg font-bold cursor-pointer focus:outline-none transition-colors
              border-x border-t
              ${
                activeTab === tab.id
                  ? "border-primary border-b-white bg-white text-primary rounded-t-xl z-10"
                  : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-t-xl"
              }
              ${idx === 0 ? "-ml-px" : ""}
            `}
            style={{ marginBottom: "-2px" }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Button (left-aligned, styled like Add New Intervention) */}
      <div className="mb-6 flex items-center justify-between">
        {activeTab === "public" ? (
          <button
            className="flex gap-1 bg-primary items-center rounded-2xl py-3 px-6 text-lg text-white font-semibold hover:cursor-pointer hover:bg-primary/90 transition-all duration-200"
            onClick={() => openModal("public")}
          >
            <Plus size={17} />
            Publish Post
          </button>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <button
                className={`flex gap-1 items-center rounded-2xl py-3 px-6 text-lg text-white font-semibold transition-all duration-200 ${
                  isOnCooldown
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-error hover:cursor-pointer hover:bg-error-dark"
                }`}
                onClick={() => openModal("alerts")}
                disabled={isOnCooldown}
              >
                <Plus size={17} />
                {isOnCooldown
                  ? `Cooldown: ${cooldownTime}s`
                  : "Send Dengue Alert"}
              </button>

              {/* Cooldown Warning - inline with button */}
              {isOnCooldown && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <Clock size={16} />
                  <span className="text-sm font-medium">
                    Please wait {cooldownTime} seconds before sending another
                    alert
                  </span>
                </div>
              )}
            </div>

            <button
              className="inline-flex items-center gap-1.5 text-sm link text-primary hover:text-accent underline"
              onClick={() => setShowAlertGuide(true)}
              aria-label="What does a Dengue Alert do?"
              title="What does a Dengue Alert do?"
            >
              <Info size={16} />
              <span>What does a Dengue Alert do?</span>
            </button>
          </>
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
        <div className="modal-box bg-transparent shadow-none rounded-3xl w-11/12 max-w-3xl relative">
          <button
            className="absolute top-9 right-10 text-xl font-normal text-gray-300 hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer z-10"
            onClick={closeModal}
          >
            ✕
          </button>
          {modalType === "public" && <FormPublicPost onSuccess={closeModal} />}
          {modalType === "alerts" && (
            <FormDengueAlert onSuccess={handleAlertSuccess} />
          )}
        </div>
      </dialog>
      {showAlertGuide && (
        <dialog open className="modal z-[1200]">
          <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-3xl p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-2xl font-extrabold text-primary">
                Dengue Alert Guide
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAlertGuide(false)}
                aria-label="Close dengue alert guide"
              >
                ✕
              </button>
            </div>
            <div className="prose max-w-none text-primary">
              <p className="mb-4">
                Dengue Alerts immediately notify BuzzMap mobile users within the
                affected barangay. Use alerts for time-sensitive risks (e.g.,
                surge in cases, active breeding sites, or urgent community
                actions).
              </p>
              <p className="text-lg font-bold mt-3">Before you send</p>
              <ul className="list-disc ml-5">
                <li>
                  Confirm the barangay and ensure the information is accurate.
                </li>
                <li>Keep the message concise, actionable, and time-bound.</li>
                <li>Avoid sensitive personal data or unverified claims.</li>
              </ul>
              <p className="text-lg font-bold mt-4">Suggested steps</p>
              <ol className="list-decimal ml-5">
                <li>Click "Send Dengue Alert" to open the alert form.</li>
                <li>Provide title, message, and target barangay.</li>
                <li>Review your message and send the alert.</li>
              </ol>
              <p className="text-lg font-bold mt-4">Tips</p>
              <ul className="list-disc ml-5">
                <li>
                  Use clear calls to action (e.g., avoid stagnant water, seek
                  care).
                </li>
                <li>Limit frequency to avoid alert fatigue.</li>
              </ul>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => setShowAlertGuide(false)}
              >
                Got it
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowAlertGuide(false)}>close</button>
          </form>
        </dialog>
      )}
    </main>
  );
};

export default ActivePosts;
