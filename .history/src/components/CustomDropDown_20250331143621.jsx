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
    <div className="w-full max-w-sm p-4 border rounded-lg bg-white shadow-md">
      <label className="block text-gray-700 font-semibold mb-2">
        Select Location
      </label>
      <select
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
        onChange={handleSelectChange}
        value={isCustom ? "custom" : selectedOption}
      >
        <option value="" disabled>
          Select a location
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
