import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ error, className = '' }) => {
  if (!error) return null;

  // Extract error message from different possible error structures
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  const message = getErrorMessage(error);

  return (
    <div className={`flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 ${className}`}>
      <AlertCircle size={24} className="flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default ErrorMessage; 