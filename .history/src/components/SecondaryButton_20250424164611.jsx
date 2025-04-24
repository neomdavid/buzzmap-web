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
  type = "link", // Default type is 'link'
  onClick, // Optional onClick handler
}) => {
  const buttonContent = (
    <>
      {Icon && iconPosition === "left" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}

      <span className="text-md text-primary italic font-[Inter] text-nowrap">
        {text}
      </span>

      {Icon && iconPosition === "right" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
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
        type={type} // Use the provided type (e.g., "submit")
        onClick={onClick} // Handle click event
        className={`flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
        hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
        bg-gradient-to-b from-[#FADD37] to-[#F8A900] ${className} sm:${maxWidth}`}
      >
        {buttonContent}
      </button>
    );
  }
};

export default SecondaryButton;
