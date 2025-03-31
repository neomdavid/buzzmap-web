import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative">
      <IconSearch size={26} stroke={1} className="absolute" />
      <input className="bg-base-200" />
    </div>
  );
};
export default CustomSearchBar;
