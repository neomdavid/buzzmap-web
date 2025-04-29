import { useState } from "react";
import {
  MagnifyingGlass,
  CaretDown,
  CalendarBlank,
  Clock,
} from "phosphor-react";

const CEA = () => {
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
    // Handle form submission
    console.log({ selectedBarangay, message, date, time });
    // Reset form
    setSelectedBarangay("");
    setMessage("");
    setDate("");
    setTime("");
  };

  return (
    <main className="flex flex-col w-full max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center md:text-left text-gray-800">
        Community Engagement and Awareness
      </h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 ">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white"
        >
          <div className="w-full bg-primary text-white text-center py-3">
            <p className="text-xl font-BOLD">Send Dengue Alerts</p>
          </div>

          <div className="flex flex-col gap-4 p-6">
            {/* Barangay Selection */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">
                Select Barangay
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

            {/* Message Input */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Alert Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your alert message here..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[120px]"
                required
              />
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                  <Clock
                    className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full flex justify-center mt-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark transition-colors rounded-full font-bold text-white py-2.5 px-8 text-lg shadow-md"
              >
                Send Alert
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CEA;
