import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative my-2 mt-6">
      <IconSearch size={18} stroke={1.5} className="absolute" />
      <input className="bg-base-200 w-full" />
    </div>
  );
};
export default CustomSearchBar;
