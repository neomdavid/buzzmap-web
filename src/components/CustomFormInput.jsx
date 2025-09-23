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
  isRequired = false,
  id,
  name,
  placeholder,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isDark = theme === "dark";
  const inputId = id || `${(label || "input").toString().toLowerCase().replace(/\s+/g, "-")}`;
  const inputName = name || inputId;
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full text-left relative z-1000000">
      <label
        className={`block mb-2 font-semibold text-md lg:text-xl ${isDark ? "text-white" : "text-black"
          }`}
        htmlFor={inputId}
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
          ${!error && `focus-within:outline focus-within:outline-2 ${isDark
            ? "focus-within:outline-base-200"
            : "focus-within:outline-primary"
          }`}
          ${className}`}
      >
        <input
          id={inputId}
          name={inputName}
          type={inputType}
          value={value}
          onChange={onChange}
          required={isRequired}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full text-xl p-2 pr-14 outline-none bg-transparent text-base ${isDark ? "text-white placeholder-gray-400" : "text-black"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            className={`absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer transition-colors w-12 h-12 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 ${isDark ? "text-white" : "text-gray-500"
              }`}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomFormInput;
