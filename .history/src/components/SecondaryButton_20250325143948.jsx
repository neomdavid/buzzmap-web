import { ArrowRight } from "phosphor-react";

const SecondaryButton = ({
  text,
  to,
  maxWidth,
  Icon = ArrowRight, // Default icon
  strokeWidth = 2,
  iconColor = "text-primary",
  iconBg = "bg-white", // Default background color for the icon
  iconSize = 24, // Icon size in pixels
  iconPadding = "p-2", // Padding for background
  iconPosition = "right",
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-4 px-8 justify-center shadow-lg rounded-xl font-semibold 
      hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70 
      ${maxWidth || ""} bg-gradient-to-b from-[#FADD37] to-[#F8A900]`}
    >
      {iconPosition === "left" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}
      <span className="text-md italic font-[Inter]">{text}</span>
      {iconPosition === "right" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}
    </div>
  );
};
