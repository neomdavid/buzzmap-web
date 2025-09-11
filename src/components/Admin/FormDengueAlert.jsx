import { useState, useRef } from "react";
import { IconAlertCircle, IconChevronDown, IconX } from "@tabler/icons-react";
import { toast } from "react-toastify";
import {
  useGetBarangaysQuery,
  useSendDengueAlertMutation,
} from "../../api/dengueApi";

const FormDengueAlert = ({ onSuccess }) => {
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MESSAGE_CHAR_LIMIT = 280;
  const confirmRef = useRef(null);

  const { data: barangays } = useGetBarangaysQuery();
  const [sendAlert] = useSendDengueAlertMutation();

  const handleBarangayChange = (e) => {
    const value = e.target.value;
    if (value === "") return;

    if (selectedBarangays.includes(value)) {
      setSelectedBarangays((prev) => prev.filter((id) => id !== value));
    } else {
      setSelectedBarangays((prev) => [...prev, value]);
    }
  };

  const handleMessageChange = (value) => {
    if (value.length > MESSAGE_CHAR_LIMIT) return;
    setMessage(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    confirmRef.current?.showModal();
  };

  const handleConfirmSend = async () => {
    setIsSubmitting(true);
    try {
      const trimmed = message.trim();
      const alertData = {
        barangayIds: selectedBarangays,
        messages: trimmed ? [trimmed] : [],
      };

      const selectedBarangayNames = (barangays || [])
        .filter((b) => selectedBarangays.includes(b._id))
        .map((b) => b.name);

      await sendAlert(alertData).unwrap();

      // Close confirmation
      confirmRef.current?.close();

      // Custom success toast - minimal style
      toast.success(
        <div className="text-sm">
          <div className="flex items-start gap-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-success mt-0.5"
            >
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-1.293-6.707 6-6a1 1 0 1 0-1.414-1.414L10 12.172l-1.293-1.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0Z" />
            </svg>
            <div>
              <p className="text-[14px] text-success font-semibold">
                Alert sent
              </p>
              <p className="text-[12px] text-black">Delivered successfully.</p>
            </div>
          </div>

          <div className="mt-3 pl-8">
            <p className="text-[12px] text-gray-700 mb-1 font-semibold">
              Barangays
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedBarangayNames.map((n) => (
                <span
                  key={n}
                  className="px-2 py-0.5 rounded-full text-[11.5px] bg-gray-100 text-black border border-gray-200"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-2 pl-8">
            <p className="text-[12px] text-gray-700 mb-1 font-semibold">
              Message
            </p>
            <p className="text-[13px] text-black whitespace-pre-wrap">
              {trimmed}
            </p>
          </div>
        </div>,
        { autoClose: 4000, icon: false }
      );

      // Reset form
      setSelectedBarangays([]);
      setMessage("");

      // Close parent modal if provided
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to send alert:", error);
      toast.error("Failed to send alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white max-w-5xl"
      >
        <div className="w-full bg-error text-white text-center py-3">
          <div className="flex items-center justify-center gap-2">
            <IconAlertCircle size={24} stroke={2} />
            <p className="text-xl font-semibold">Send Dengue Alert</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {/* Barangay Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Select Barangays <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value=""
                onChange={handleBarangayChange}
                className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="" disabled>
                  Select barangays
                </option>
                {barangays?.map((barangay) => (
                  <option key={barangay._id} value={barangay._id}>
                    {barangay.name} ({barangay.risk_level})
                  </option>
                ))}
              </select>
              <IconChevronDown
                className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
                size={18}
              />
            </div>

            {/* Selected Barangays Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedBarangays.map((barangayId) => {
                const barangay = barangays?.find((b) => b._id === barangayId);
                return barangay ? (
                  <div
                    key={barangayId}
                    className="bg-error/10 text-error px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {barangay.name}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBarangays((prev) =>
                          prev.filter((id) => id !== barangayId)
                        )
                      }
                      className="hover:text-error-dark"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Alert Message */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Alert Message <span className="text-error">*</span>
            </label>
            <div className="flex flex-col gap-1">
              <textarea
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Type your alert message here..."
                className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[160px]"
                maxLength={MESSAGE_CHAR_LIMIT}
                required
              />
              <div className="text-sm text-gray-500 text-right">
                {message.length}/{MESSAGE_CHAR_LIMIT}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-center mt-4">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                selectedBarangays.length === 0 ||
                message.trim() === ""
              }
              className={`bg-error hover:bg-error-dark transition-all duration-300 rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md hover:cursor-pointer hover:bg-error/90 disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? "Sending Alert..." : "Send Alert"}
            </button>
          </div>
        </div>
      </form>

      {/* Confirm Send Dialog */}
      <dialog
        ref={confirmRef}
        className="modal transition-transform duration-300 ease-in-out"
      >
        <div className="modal-box border-t-10 border-t-error bg-white rounded-3xl shadow-2xl w-6/12 max-w-4xl p-6 py-10 relative">
          <button
            className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => confirmRef.current?.close()}
          >
            ✕
          </button>
          <div className="space-y-6">
            <p className="text-center text-3xl font-bold mb-2">
              <span className="text-error">Confirm Send Alert</span>
            </p>
            <hr className="border-gray-300" />
            <div className="grid grid-cols-1 gap-4 text-primary text-lg">
              <div>
                <p className="font-semibold mb-1">Barangays</p>
                <div className="bg-base-200 rounded-lg p-3">
                  <ul className="list-disc ml-6">
                    {(barangays || [])
                      .filter((b) => selectedBarangays.includes(b._id))
                      .map((b) => (
                        <li key={b._id}>{b.name}</li>
                      ))}
                  </ul>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1">Message</p>
                <div className="bg-base-200 rounded-lg p-3 whitespace-pre-wrap">
                  {message.trim()}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              <button
                onClick={handleConfirmSend}
                className="bg-error text-white font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200 flex items-center gap-2 hover:cursor-pointer disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
              <button
                onClick={() => confirmRef.current?.close()}
                className="bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200 hover:cursor-pointer disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default FormDengueAlert;
