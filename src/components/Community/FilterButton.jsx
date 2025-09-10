const FilterButton = ({ text, active, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`z-10 flex-1 px-8 py-2 rounded-full transition-all duration-300 ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : active
          ? "bg-primary text-white"
          : "bg-base-200 hover:bg-primary hover:text-white"
      }`}
    >
      {text}
    </button>
  );
};

export default FilterButton;
