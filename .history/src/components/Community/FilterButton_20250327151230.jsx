const FilterButton = ({ text }) => {
  return (
    <button className="z-100 flex-1 bg-base-200 px-8 py-1 rounded-full hover:bg-primary hover:text-white hover:cursor-pointer transition-all duration-300">
      {text}
    </button>
  );
};

export default FilterButton;
