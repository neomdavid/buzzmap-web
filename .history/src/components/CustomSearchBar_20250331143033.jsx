import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative my-2 mb-6">
      <IconSearch size={18} stroke={1.5} className="absolute" />
      <input className="bg-base-200 w-full py-2 px-6 pl-8" />
    </div>
  );
};
export default CustomSearchBar;
