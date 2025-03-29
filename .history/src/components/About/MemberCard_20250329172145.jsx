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
   
  );
};

export default AltPreventionCard;
