import React, { useEffect } from "react";
import { toastError } from "../../utils";

const GlobalErrorHandler = ({ children }) => {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Show user-friendly error message
      if (event.reason?.message) {
        toastError("Something went wrong. Please try again.");
      }

      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event) => {
      console.error("Global error:", event.error);

      // Check if it's a known error type we want to handle gracefully
      if (
        event.error?.message?.includes("AG Grid") ||
        event.error?.message?.includes("error #252") ||
        event.error?.message?.includes("cannot get grid to draw rows")
      ) {
        toastError(
          "There was an issue with the table. Please refresh the page."
        );
        event.preventDefault();
        return;
      }

      // For other errors, let them bubble up to ErrorBoundary
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    // Cleanup
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  return children;
};

export default GlobalErrorHandler;
