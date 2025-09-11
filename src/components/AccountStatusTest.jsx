import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useSessionValidation } from "../hooks/useSessionValidation";
import { dispatchAccountDisabledEvent } from "../utils/accountStatusHandler";

/**
 * Test component to demonstrate account status validation
 * This component can be temporarily added to admin pages for testing
 */
const AccountStatusTest = () => {
  const [isVisible, setIsVisible] = useState(false);
  const user = useSelector((state) => state.auth?.user);
  const { validateAccountStatus } = useSessionValidation();

  // Only show for admin/superadmin users
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return null;
  }

  const handleManualValidation = () => {
    console.log("[AccountStatusTest] Manual validation triggered");
    const isValid = validateAccountStatus();
    console.log("[AccountStatusTest] Validation result:", isValid);
  };

  const handleSimulateDisabled = () => {
    console.log("[AccountStatusTest] Simulating account disabled event");
    dispatchAccountDisabledEvent(
      "Test: Your account has been disabled for testing purposes."
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm shadow-lg hover:bg-blue-600"
        >
          Test Account Status
        </button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg min-w-64">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Account Status Test</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <strong>User:</strong> {user.name} ({user.role})
            </div>
            <div className="text-sm text-gray-600">
              <strong>Email:</strong> {user.email}
            </div>

            <div className="flex flex-col gap-2 mt-3">
              <button
                onClick={handleManualValidation}
                className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
              >
                Validate Account Status
              </button>

              <button
                onClick={handleSimulateDisabled}
                className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
              >
                Simulate Account Disabled
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              <p>• Manual validation checks current account status</p>
              <p>• Simulate disabled triggers logout for testing</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStatusTest;
