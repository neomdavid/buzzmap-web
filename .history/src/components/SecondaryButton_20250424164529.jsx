const SecondaryButton = ({
  text,
  to,
  type = "button", // Add type prop
  maxWidth = "max-w-[200px]",
  className = "",
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

      {type === "link" ? (
        <Link
          to={to}
          className="text-md text-primary italic font-[Inter] text-nowrap"
        >
          {text}
        </Link>
      ) : (
        <button
          type={type}
          className="text-md text-primary italic font-[Inter] text-nowrap"
        >
          {text}
        </button>
      )}

      {Icon && iconPosition === "right" && (
        <div className={`rounded-full ${iconBg} ${iconPadding}`}>
          <Icon size={iconSize} weight="bold" className={iconColor} />
        </div>
      )}
    </div>
  );
};

export default SecondaryButton;
