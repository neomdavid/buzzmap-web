import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = ({ placeholder }) => {
  return (
    <div className="relative my-2 mb-6">
      <IconSearch size={16} stroke={2} className="absolute left-5 top-3" />
      <input
        placeholder={placeholder}
        className="bg-base-200 w-full py-3 px-6 pl-14 rounded-lg focus:outline-none"
      />
    </div>
  );
};
export default CustomSearchBar;
