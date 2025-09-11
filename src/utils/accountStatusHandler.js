import { logout } from "../features/authSlice";
import { toastError } from "../utils.jsx";

/**
 * Utility functions for handling account status changes
 */

/**
 * Dispatches a custom event when an account is disabled
 * This allows components to listen for account disabled events
 */
export const dispatchAccountDisabledEvent = (
  message = "Your account has been disabled. Please contact an administrator."
) => {
  const event = new CustomEvent("accountDisabled", {
    detail: {
      status: "ACCOUNT_DISABLED",
      message: message,
      timestamp: new Date().toISOString(),
    },
  });

  window.dispatchEvent(event);
  console.log("[AccountStatusHandler] Account disabled event dispatched");
};

/**
 * Handles account disabled errors from API responses
 * This function should be called when API returns account disabled errors
 */
export const handleAccountDisabledError = (
  dispatch,
  navigate,
  errorMessage
) => {
  console.log(
    "[AccountStatusHandler] Handling account disabled error:",
    errorMessage
  );

  // Clear auth data
  dispatch(logout());

  // Show error message
  toastError(
    errorMessage ||
      "Your account has been disabled. Please contact an administrator."
  );

  // Dispatch custom event for other components to listen
  dispatchAccountDisabledEvent(errorMessage);

  // Redirect to login
  navigate("/login", { replace: true });
};

/**
 * Checks if an error response indicates account is disabled
 */
export const isAccountDisabledError = (error) => {
  if (!error) return false;

  const errorMessage =
    error?.data?.message || error?.data || error?.message || "";
  const status = error?.status;

  return (
    status === "ACCOUNT_DISABLED" ||
    status === 403 ||
    (status === 401 &&
      (errorMessage.toLowerCase().includes("disabled") ||
        errorMessage.toLowerCase().includes("account disabled") ||
        errorMessage.toLowerCase().includes("inactive") ||
        errorMessage.toLowerCase().includes("suspended")))
  );
};

/**
 * Sets up a global error handler for account disabled errors
 * This should be called once in your app initialization
 */
export const setupGlobalAccountStatusHandler = (store, navigate) => {
  // Listen for account disabled events
  const handleAccountDisabled = (event) => {
    console.log(
      "[AccountStatusHandler] Global account disabled event received:",
      event.detail
    );

    const dispatch = store.dispatch;
    const message =
      event.detail?.message ||
      "Your account has been disabled. Please contact an administrator.";

    handleAccountDisabledError(dispatch, navigate, message);
  };

  window.addEventListener("accountDisabled", handleAccountDisabled);

  // Return cleanup function
  return () => {
    window.removeEventListener("accountDisabled", handleAccountDisabled);
  };
};
