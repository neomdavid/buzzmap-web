import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth = "max-w-[200px]",
  className = "",
  Icon,
  strokeWidth = 3,
  iconColor = "text-secondary",
  iconBg = "bg-primary",
  iconSize = 12,
  iconPadding = "p-1",
  iconPosition = "right",
  type = "link",
  onClick,
  isLoading = false, // Add isLoading prop
  loadingText = "Loading...", // Optional custom loading text
}) => {
  const buttonContent = (
    <>
      {Icon && iconPosition === "left" && !isLoading && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}

      <span className="text-md text-primary italic font-[Inter] text-nowrap">
        {isLoading ? loadingText : text}
      </span>

      {Icon && iconPosition === "right" && !isLoading && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}

      {/* Loading spinner when isLoading is true */}
      {isLoading && (
        <div className="ml-2">
          <svg
            className="animate-spin h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </>
  );

  if (type === "link") {
    return (
      <Link
        to={to}
        className={`flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
        hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
        bg-gradient-to-b from-[#FADD37] to-[#F8A900] ${className} sm:${maxWidth}`}
      >
        {buttonContent}
      </Link>
    );
  } else {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={isLoading} // Disable button when loading
        className={`flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
        hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
        bg-gradient-to-b from-[#FADD37] to-[#F8A900] ${className} sm:${maxWidth}
        ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`} // Add disabled styles
      >
        {buttonContent}
      </button>
    );
  }
};

export default SecondaryButton;
