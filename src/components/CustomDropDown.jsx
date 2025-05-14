import { useState } from "react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";

const CustomDropDown = ({
  options,
  onSelect,
  className,
  fillColor = "dark",
}) => {
  const [inputValue, setInputValue] = useState(""); // Stores input value
  const [filteredOptions, setFilteredOptions] = useState(options); // Stores filtered list
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);

    // Filter options that include user input
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);

    onSelect(value);
  };

  const handleOptionSelect = (option) => {
    setInputValue(option);
    setShowDropdown(false);
    onSelect(option);
  };

  return fillColor === "dark" ? (
    <div
      className={`w-full max-w-sm relative text-white z-10 ${className}`}
    >
      <div className="relative">
        <input
          type="text"
          className="w-full p-4 pr-12 border-[1.5px] border-white rounded-full bg-transparent text-white placeholder-white focus:outline-none focus:ring-1 focus:ring-base-200"
          placeholder="Select Location"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
        />
        <IconChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white pointer-events-none hover:cursor-pointer z-10" />
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <ul className="absolute w-full bg-white text-black border border-gray-300 rounded-md mt-1 shadow-lg z-50">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className="p-3 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : (
    <div
      className={`w-full max-w-sm relative text-white z-10 ${className}`}
    >
      <div className="relative">
        <input
          type="text"
          className="w-full p-3.5 pr-12 border-[1.5px] border-white rounded-2xl bg-white text-primary placeholder-primary text-[12px] focus:outline-none focus:ring-1 focus:ring-base-200"
          placeholder="Select Location"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
        />
        <IconSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary pointer-events-none hover:cursor-pointer z-10" />
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <ul className="absolute w-full bg-white text-black border border-gray-300 rounded-md mt-1 shadow-lg z-50">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className="p-3 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropDown;
