import { useState } from "react";

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
    <div className="w-full max-w-sm  d text-primary">
      <select
        className="w-full p-3 border-[1.5px] border-white rounded-full text-gray-500 hover:cursor-pointer"
        onChange={handleSelectChange}
        value={selectedOption || ""}
      >
        <option value="" disabled hidden>
          Select Location
        </option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
        <option value="custom">Enter custom location</option>
      </select>

      {isCustom && (
        <input
          type="text"
          className="w-full p-2 mt-2 border rounded-md focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your location"
          value={customInput}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};

export default CustomDropDown;
