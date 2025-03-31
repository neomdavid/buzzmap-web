import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
const CustomDropDown = ({ options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsCustom(true);
      setSelectedOption("");
    } else {
      setIsCustom(false);
      setSelectedOption(value);
      onSelect(value);
    }
  };

  const handleInputChange = (e) => {
    setCustomInput(e.target.value);
    onSelect(e.target.value);
  };

  return (
    <div className="w-full max-w-sm relative text-white">
      <div className="relative">
        <select
          className="w-full p-4 pr-12 border-[1.5px] border-white rounded-full bg-transparent text-white hover:cursor-pointer appearance-none"
          onChange={handleSelectChange}
          value={selectedOption || ""}
        >
          <option value="" disabled hidden>
            Select Location
          </option>
          {options.map((option, index) => (
            <option key={index} value={option} className="text-black">
              {option}
            </option>
          ))}
          <option value="custom" className="text-black">
            Enter custom location
          </option>
        </select>
        <IconChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
      </div>

      {isCustom && (
        <input
          type="text"
          className="w-full p-2 mt-2 border border-white rounded-md bg-transparent text-white placeholder-white focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your location"
          value={customInput}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};

export default CustomDropDown;
