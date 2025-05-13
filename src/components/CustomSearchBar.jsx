import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search..."}
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="absolute left-3 top-2.5">
        <IconSearch size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

export default CustomSearchBar;
