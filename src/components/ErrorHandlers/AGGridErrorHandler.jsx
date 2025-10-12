import React, { useEffect } from "react";
import { toastError } from "../../utils";

const AGGridErrorHandler = ({ children }) => {
  useEffect(() => {
    // Override console.error to catch AG Grid errors
    const originalConsoleError = console.error;

    console.error = (...args) => {
      const errorMessage = args.join(" ");

      // Check if it's an AG Grid error
      if (
        errorMessage.includes("error #252") ||
        errorMessage.includes("cannot get grid to draw rows") ||
        errorMessage.includes("ag-grid")
      ) {
        // Show user-friendly error message
        toastError("There was an issue updating the table. Please try again.");

        // Log the technical error for debugging
        originalConsoleError("AG Grid Error:", ...args);

        return;
      }

      // For other errors, use the original console.error
      originalConsoleError(...args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return children;
};

export default AGGridErrorHandler;
