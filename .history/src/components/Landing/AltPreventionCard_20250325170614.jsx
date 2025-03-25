import { CaretRight } from "phosphor-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const AltPreventionCard = ({
  title,
  subtext,
  category,
  Icon,
  iconSize,
  iconPosition,
  titlePosition,
  subtextPosition,
  categoryPosition,
  bgColor,
  to,
}) => {
  const navigate = useNavigate();

  return (
    <section
      className="min-w-[200px] h-[290px] relative rounded-[37px] overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Positioned Icon */}
      {Icon && (
        <Icon
          size={iconSize || 80} // Default size if not specified
          className={`absolute text-white opacity-60 ${iconPosition}`}
        />
      )}

      {/* Title */}
      <p className={`absolute text-3xl text-white font-bold ${titlePosition}`}>
        {title}
      </p>

      {/* Subtext */}
      <p
        className={`absolute text-sm text-white opacity-80 ${subtextPosition}`}
      >
        {subtext}
      </p>

      {/* Category */}
      <p
        className={`absolute text-xs font-normal p-2 px-4 rounded-full italic font-bold text-primary bg-white w-fit ${categoryPosition}`}
      >
        {category}
      </p>

      {/* Circle with Icon (Navigates to `to` prop) */}
      <div
        className="h-27 w-27 bg-white border-18 border-primary rounded-full absolute right-[-18px] bottom-[-13px] flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 hover:bg-primary hover:border-white"
        onClick={() => navigate(to)}
      >
        <CaretRight
          size={24}
          weight="bold"
          className="text-primary hover:text-white transition-colors duration-300"
        />
      </div>
    </section>
  );
};

export default AltPreventionCard;
