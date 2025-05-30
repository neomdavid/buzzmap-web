import { useState } from "react";
import { CaretDown, CalendarBlank, Clock } from "phosphor-react";

const FormDengueAlert = () => {
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const barangays = [
    "Barangay 1",
    "Barangay 2",
    "Barangay 3",
    "Barangay 4",
    "Barangay 5",
    "Barangay 6",
    "Barangay 7",
    "Barangay 8",
    "Barangay 9",
    "Barangay 10",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ selectedBarangay, message, date, time });
    setSelectedBarangay("");
    setMessage("");
    setDate("");
    setTime("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white"
    >
      <div className="w-full bg-primary text-white text-center py-3">
        <p className="text-xl font-semibold">Send Dengue Alerts</p>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Select Barangay <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            >
              <option value="" disabled>
                Select a barangay
              </option>
              {barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
            <CaretDown
              className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Alert Message <span className="text-error">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your alert message here..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[120px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Date <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Time <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center mt-4">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark transition-colors rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md"
          >
            Send Alert
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormDengueAlert;
