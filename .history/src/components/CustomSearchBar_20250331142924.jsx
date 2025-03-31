import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative">
      <IconSearch size={18} stroke={2} className="absolute" />
      <input className="bg-base-200" />
    </div>
  );
};
export default CustomSearchBar;
