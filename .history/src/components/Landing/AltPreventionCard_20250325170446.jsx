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
  bgColor,
  to,
}) => {
  const navigate = useNavigate();

  return (
    <section
      className="min-w-[200px] h-[290px] relative rounded-[37px] overflow-hidden flex flex-col justify-end p-5"
      style={{ backgroundColor: bgColor }}
    >
      {/* Positioned Icon */}
      {Icon && (
        <Icon
          size={iconSize || 80} // Default size if not specified
          className={`absolute text-white opacity-60 ${iconPosition}`}
        />
      )}

      {/* Title & Subtext */}
      <div className="mb-10">
        <p className="text-3xl text-white font-bold">{title}</p>
        <p className="text-sm text-white opacity-80">{subtext}</p>
      </div>

      {/* Category */}
      <p className="text-xs font-normal p-2 px-4 rounded-full italic font-bold text-primary bg-white w-fit">
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
