import { useState } from "react";
import { CaretDown, CalendarBlank } from "phosphor-react";
import { useGetAllAdminPostsQuery, useGetAllAlertsQuery } from "../../api/dengueApi";

const CoordinationRequestForm = () => {
  const [selectedPartner, setSelectedPartner] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [requestType, setRequestType] = useState("");
  const [affectedLocation, setAffectedLocation] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const partners = [
    "Local Health Office",
    "Municipal Disaster Risk Reduction Office",
    "Barangay Health Workers",
    "Red Cross Volunteers",
  ];

  const requestTypes = [
    "Clean-up Drive",
    "Dengue Awareness Seminar",
    "Fogging Operation",
    "Larvicide Treatment",
    "Medical Mission",
    "Vector Surveillance",
  ];

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

  const { data: alerts, isLoading: loadingAlerts } = useGetAllAlertsQuery();

  console.log("alerts response:", alerts, "loading:", loadingAlerts);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      selectedPartner,
      partnerEmail,
      requestType,
      affectedLocation,
      preferredDate,
      additionalNotes,
    });
    // Reset form
    setSelectedPartner("");
    setPartnerEmail("");
    setRequestType("");
    setAffectedLocation("");
    setPreferredDate("");
    setAdditionalNotes("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white max-w-5xl"
    >
      <div className="w-full bg-primary text-white text-center py-3">
        <p className="text-xl font-semibold">Coordination Request</p>
      </div>

      <div className="flex flex-col gap-4 p-6">
        {/* Partner Selection */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Select Partner <span className="text-error">*</span>
          </label>

          {/* Responsive row on sm and up, stacked on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Dropdown */}
            <div className="relative w-full sm:w-1/2">
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="" disabled>
                  Select partner LGU/Agency/Volunteer
                </option>
                {partners.map((partner) => (
                  <option key={partner} value={partner}>
                    {partner}
                  </option>
                ))}
              </select>
              <CaretDown
                className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
                size={18}
              />
            </div>

            {/* OR separator */}
            <div className="text-center font-medium text-gray-500 sm:w-auto">
              OR
            </div>

            {/* Email input */}
            <div className="w-full sm:w-1/2">
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="Enter partner's email address"
                className="w-full p-2.5 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Request Type */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Request Type <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            >
              <option value="" disabled>
                Select intervention type
              </option>
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <CaretDown
              className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        {/* Affected Location */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Affected Location <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              value={affectedLocation}
              onChange={(e) => setAffectedLocation(e.target.value)}
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            >
              <option value="" disabled>
                Select barangay
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

        {/* Preferred Date */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Preferred Date <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary font-semibold">
            Additional Notes <span className="text-error">*</span>
          </label>
          <textarea
            required
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Provide any additional information about your request..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[100px]"
          />
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-center mt-4">
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark transition-all duration-300 rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md hover:cursor-pointer hover:bg-primary/90"
          >
            Send Request
          </button>
        </div>
      </div>
    </form>
  );
};

export default CoordinationRequestForm;
