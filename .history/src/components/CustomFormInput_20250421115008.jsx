import { useEffect, useState } from "react";

const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"];

const CustomFormInput = ({
  label,
  placeholder,
  type = "text",
  isConfirm = false,
  theme = "dark",
  value,
  onChange, // <-- Accept external change handler
}) => {
  const [error, setError] = useState("");

  const validateInput = (inputValue) => {
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        setError("Invalid email format.");
      } else {
        setError("");
      }
    } else if (type === "password") {
      const minLength = 8;
      const maxLength = 64;
      const containsLetter = /[a-zA-Z]/.test(inputValue);
      const containsNumber = /\d/.test(inputValue);
      const containsSpecialChar = /[@$!%*?&]/.test(inputValue);

      if (inputValue.length < minLength) {
        setError("Password must be at least 8 characters long.");
      } else if (inputValue.length > maxLength) {
        setError("Password must not exceed 64 characters.");
      } else if (commonPasswords.includes(inputValue.toLowerCase())) {
        setError("This password is too common. Choose a stronger one.");
      } else if (!containsLetter || !containsNumber || !containsSpecialChar) {
        setError(
          "Password must contain at least one letter, one number, and one special character (!, @, #, $)."
        );
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  // Run validation when value changes (if not isConfirm)
  useEffect(() => {
    if (!isConfirm) {
      validateInput(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-left font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
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
