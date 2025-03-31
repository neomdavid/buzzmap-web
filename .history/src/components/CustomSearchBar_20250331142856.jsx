import { IconSearch } from "@tabler/icons-react";

const CustomSearchBar = () => {
  return (
    <div className="relative">
      <IconSearch
        size={23}
        stroke={1}
        className="cursor-pointer hover:opacity-80"
      />
      <input className="bg-base-200" />
    </div>
  );
};
export default CustomSearchBar;
