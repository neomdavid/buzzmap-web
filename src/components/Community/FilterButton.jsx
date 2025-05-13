const FilterButton = ({ text, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`z-10 flex-1 px-8 py-2 rounded-full transition-all duration-300 ${
        active 
          ? "bg-primary text-white" 
          : "bg-base-200 hover:bg-primary hover:text-white"
      }`}
    >
      {text}
    </button>
  );
};

export default FilterButton;
