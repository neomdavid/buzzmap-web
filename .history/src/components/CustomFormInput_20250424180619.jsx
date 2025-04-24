// components/CustomFormInput.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // or any icon library
import { IconEye, IconEyeOff } from "@tabler/icons-react";
const CustomFormInput = ({
  label,
  type = "text",
  value,
  onChange,
  theme = "light",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="w-full text-left relative">
      <label className="block mb-2 font-semibold text-xl">{label}</label>
      <div
        className={`relative border rounded-xl px-3 py-2 transition-all duration-200 ${
          isFocused
            ? theme === "dark"
              ? "outline outline-white"
              : "outline outline-primary"
            : "border-gray-300"
        } focus-within:outline ${
          theme === "dark"
            ? "focus-within:outline-white"
            : "focus-within:outline-primary"
        }`}
      >
        <input
          type={isPassword && !showPassword ? "password" : "text"}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full text-xl p-2 outline-none bg-transparent text-base"
        />
        {isPassword && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
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
