import { FormPublicPost, FormDengueAlert } from "../../components";

const CEA = () => {
  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center md:text-left text-gray-800">
        Community Engagement and Awareness
      </h1>

      {/* First Row - Two Forms */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
        <FormPublicPost />
        <FormDengueAlert />
      </section>

      {/* Second Row - Coordination Request Form */}
      <section className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white">
        <div className="w-full bg-primary text-white text-center py-3">
          <h2 className="text-xl font-semibold">Coordination Request</h2>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {/* Partner Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Select Partner <span className="text-error">*</span>
            </label>
            <div className="flex flex-col gap-4">
              <select className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                <option value="" disabled selected>
                  Select partner LGU/Agency/Volunteer
                </option>
                <option>Local Health Office</option>
                <option>Municipal Disaster Risk Reduction Office</option>
                <option>Barangay Health Workers</option>
                <option>Red Cross Volunteers</option>
              </select>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">
                  OR
                </span>
                <input
                  type="email"
                  placeholder="Enter partner's email address"
                  className="w-full p-2.5 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Request Type */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Request Type <span className="text-error">*</span>
            </label>
            <select
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            >
              <option value="" disabled selected>
                Select intervention type
              </option>
              <option>Clean-up Drive</option>
              <option>Dengue Awareness Seminar</option>
              <option>Fogging Operation</option>
              <option>Larvicide Treatment</option>
              <option>Medical Mission</option>
              <option>Vector Surveillance</option>
            </select>
          </div>

          {/* Affected Location */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Affected Location <span className="text-error">*</span>
            </label>
            <select
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            >
              <option value="" disabled selected>
                Select barangay
              </option>
              <option>Barangay 1</option>
              <option>Barangay 2</option>
              <option>Barangay 3</option>
              <option>Barangay 4</option>
              <option>Barangay 5</option>
              <option>Barangay 6</option>
              <option>Barangay 7</option>
              <option>Barangay 8</option>
              <option>Barangay 9</option>
              <option>Barangay 10</option>
            </select>
          </div>

          {/* Preferred Date */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Preferred Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>

          {/* Additional Notes */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Additional Notes
            </label>
            <textarea
              placeholder="Provide any additional information about your request..."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-center mt-4">
            <button
              type="button"
              className="bg-primary hover:bg-primary-dark transition-colors rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md"
            >
              Send Request
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CEA;
