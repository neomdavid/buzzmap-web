import React from "react";

const CustomModalToast = ({ message, type, onClose }) => {
  return (
    <div className={`
      fixed top-[10vh] left-1/2 -translate-x-1/2
      ${type === "error" ? "bg-error" : type === "warning" ? "bg-warning" : "bg-success"}
      text-white px-5 py-2.5 rounded-lg text-lg z-[9999999]
      opacity-100 transition-opacity duration-500
      flex justify-between items-center w-auto
    `}>
      <span className="text-center">{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-white border-none bg-transparent focus:outline-none hover:cursor-pointer hover:bg-gray-600 p-4 h-6 w-6 flex justify-center items-center rounded-full transition-all duration-300"
      >
        ✕
      </button>
    </div>
  );
};

export default CustomModalToast;
