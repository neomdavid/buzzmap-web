import { useState, useEffect } from "react";

const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"];

const CustomFormInput = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  isConfirm = false,
  theme = "dark",
  error,
  validateInput,
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
    if (!isConfirm && validateInput) {
      validateInput(e.target.value);
    }
  };

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-left font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className={`bg-base-200 font-bold text-black/80 py-3 px-4 w-full rounded-2xl focus:outline-none ${
          error ? "border-3 border-red-400" : ""
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p
          className={`${
            theme === "dark" ? "text-white" : "text-primary"
          } mx-1 font-light italic text-left text-[12px]`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomFormInput;
