import { CaretRight } from "phosphor-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const AltPreventionCard = ({
  title,
  subtext,
  category,
  Icon,
  iconSize = 80, // Default icon size
  iconPosition = "",
  iconRotation = 0,
  titlePosition = "",
  subtextPosition = "",
  categoryPosition = "",
  titleAlign = "left", // Default alignment
  subtextAlign = "left", // Default alignment
  bgColor = "bg-white", // Default to white if no class is provided
  to,
}) => {
  const navigate = useNavigate();

  return (
    <section
      className={`min-w-[200px] h-[290px] lg:min-w-[250px] lg:h-[340px] relative rounded-[37px] xl:h-[400px] xl:min-w-[300px] 2xl:min-w-[320px] 2xl:min-h-[450px]  flex ${bgColor}`}
    >
      {/* Positioned and Rotated Icon */}
      {Icon && (
        <Icon
          size={iconSize}
          weight="fill"
          className={`absolute text-primary lg:w-45 lg:h-45 xl:w-60 xl:h-60 ${iconPosition}`}
          style={{ transform: `rotate(${iconRotation}deg)` }}
        />
      )}

      {/* Title */}
      <p
        className={`absolute mx-2 text-4xl leading-8 text-primary font-bold  lg:text-[32px] lg:leading-9 xl:text-[40px] xl:leading-11 ${titlePosition} text-${titleAlign}`}
      >
        {title}
      </p>

      {/* Subtext */}
      <p
        className={`absolute text-md max-w-[140px] font-semibold text-primary opacity-80 xl:text-[12.5px] xl:max-w-[160px] ${subtextPosition} text-${subtextAlign}`}
      >
        {subtext}
      </p>

      {/* Category */}
      <p
        className={`absolute text-xs font-normal p-2 px-4 rounded-full italic font-bold text-primary bg-white w-fit xl:text-[11px] ${categoryPosition}`}
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
