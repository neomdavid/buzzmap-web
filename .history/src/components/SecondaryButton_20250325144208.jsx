import { Link } from "react-router-dom";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon,
  strokeWidth = 2,
  iconColor = "stroke-primary",
  iconBg = "bg-white",
  iconSize = 14,
  iconPadding = "p-2",
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      ${maxWidth || ""} bg-gradient-to-b from-[#FADD37] to-[#F8A900]`}
    >
      {/* Left Icon (Optional) */}
      {Icon && iconPosition === "left" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}

      <Link to={to} className="text-md italic font-[Inter]">
        {text}
      </Link>

      {/* Right Icon (Optional) */}
      {Icon && iconPosition === "right" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}
    </div>
  );
};

export default SecondaryButton;
