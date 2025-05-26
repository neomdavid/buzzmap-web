import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const CustomFormInput = ({
  label,
  type = "text",
  value,
  onChange,
  theme = "light",
  className = "",
  error = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isDark = theme === "dark";

  return (
    <div className="w-full text-left relative">
      <label
        className={`block mb-2 font-semibold text-xl ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        {label}
      </label>
      <div
        className={`relative rounded-xl px-3 py-2 transition-all duration-200 border
          ${error 
            ? "border-red-500 focus-within:outline-red-500 focus-within:outline focus-within:outline-2" 
            : isFocused
              ? isDark
                ? "outline outline-base-200 border-base-200"
                : "outline outline-primary border-primary"
              : isDark 
                ? "border-white" 
                : "border-gray-300"
          }
          ${!error && `focus-within:outline focus-within:outline-2 ${
            isDark
              ? "focus-within:outline-base-200"
              : "focus-within:outline-primary"
          }`}
          ${className}`}
      >
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full text-xl p-2 outline-none bg-transparent text-base ${
            isDark ? "text-white placeholder-gray-400" : "text-black"
          }`}
        />
        {isPassword && (
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${
              isDark ? "text-white" : "text-gray-500"
            }`}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomFormInput;
