// Error handling utilities for better user experience

export const handleError = (error, context = "") => {
  console.error(`Error in ${context}:`, error);

  // Extract user-friendly error message
  let userMessage = "Something went wrong. Please try again.";

  if (typeof error === "string") {
    userMessage = error;
  } else if (error?.data?.message) {
    userMessage = error.data.message;
  } else if (error?.message) {
    userMessage = error.message;
  } else if (error?.response?.data?.message) {
    userMessage = error.response.data.message;
  }

  return userMessage;
};

export const isAGGridError = (error) => {
  const errorMessage = error?.message || error?.toString() || "";
  return (
    errorMessage.includes("error #252") ||
    errorMessage.includes("cannot get grid to draw rows") ||
    errorMessage.includes("ag-grid")
  );
};

export const isNetworkError = (error) => {
  const errorMessage = error?.message || error?.toString() || "";
  return (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError") ||
    errorMessage.includes("Connection refused")
  );
};

export const getErrorMessage = (error) => {
  if (isAGGridError(error)) {
    return "There was an issue updating the table. Please try again.";
  }

  if (isNetworkError(error)) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  return handleError(error);
};
