import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative">
      <IconSearch size={18} stroke={1.5} className="absolute" />
      <input className="bg-base-200 w-full" />
    </div>
  );
};
export default CustomSearchBar;
