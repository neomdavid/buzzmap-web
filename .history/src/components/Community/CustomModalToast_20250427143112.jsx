import React from "react";

const CustomModalToast = ({ message, type, onClose }) => {
  // Determine background color based on type
  let backgroundColor;
  if (type === "error") {
    backgroundColor = "#f44336"; // Red for error
  } else if (type === "warning") {
    backgroundColor = "#FF9800"; // Orange for warning
  } else {
    backgroundColor = "#4CAF50"; // Green for success
  }

  const toastStyle = {
    position: "fixed",
    top: "10vh", // Toast will appear 10% from the top
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: backgroundColor, // Use the determined background color
    color: "#FFFFFF",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    zIndex: 9999999,
    opacity: 1,
    transition: "opacity 0.5s",
    display: "flex", // Use flex to align the button to the right
    justifyContent: "space-between", // Space between message and button
    alignItems: "center", // Align items vertically centered
    width: "auto", // Allow the width to adjust to content
  };

  return (
    <div style={toastStyle}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-white border-none bg-transparent focus:outline-none hover:cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};

export default CustomModalToast;
