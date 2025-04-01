import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth = "max-w-[200px]", // Retained maxWidth
  className = "", // Added className prop
  Icon,
  strokeWidth = 3,
  iconColor = "text-secondary",
  iconBg = "bg-primary",
  iconSize = 12,
  iconPadding = "p-1",
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center text-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      bg-gradient-to-b from-[#FADD37] to-[#F8A900] ${className} sm:${maxWidth}`}
    >
      {Icon && iconPosition === "left" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}

      <Link to={to} className="text-md italic font-[Inter] text-nowrap">
        {text}
      </Link>

      {Icon && iconPosition === "right" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}
    </div>
  );
};

export default SecondaryButton;
