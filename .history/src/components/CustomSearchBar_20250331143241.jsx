import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative my-2 mb-6">
      <IconSearch size={16} stroke={1.5} className="absolute left-3 top-2.5" />
      <input
        placeholder="Search for latest reports..."
        className="bg-base-200 w-full py-4 px-6 pl-12 rounded-lg focus:outline-none"
      />
    </div>
  );
};
export default CustomSearchBar;
