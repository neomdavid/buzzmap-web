import React from "react";

const CustomModalToast = ({ message, type, onClose }) => {
  const toastStyle = {
    position: "fixed",
    top: "10vh", // Toast will appear 10% from the top
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: type === "error" ? "#f44336" : "#4CAF50", // Red for error, Green for success
    color: "#FFFFFF",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    zIndex: 9999999,
    opacity: 1,
    transition: "opacity 0.5s",
  };

  return (
    <div style={toastStyle}>
      {message}
      <button onClick={onClose} style={{ marginLeft: "10px", color: "white" }}>
        ✕
      </button>
    </div>
  );
};

export default CustomModalToast;
