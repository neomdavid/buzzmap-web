import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorMessage = ({ error, className = "", onDismiss }) => {
  if (!error) return null;

  // Extract error message from different possible error structures
  const getErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return "An unexpected error occurred";
  };

  const message = getErrorMessage(error);

  return (
    <div
      className={`flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 ${className}`}
    >
      <AlertCircle size={24} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:bg-red-100 rounded-full p-1 transition-colors"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
