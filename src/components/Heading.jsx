import React from "react";

const Heading = ({ text = "", className = "", as = "h1" }) => {
  const highlightText = (text) => {
    if (typeof text !== "string") return text;
    const parts = text.split(/\/(.*?)\//g);
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className="text-accent">
          {part}
        </span>
      ) : (
        <span key={index} className="text-primary">
          {part}
        </span>
      )
    );
  };

  const Tag = as;

  return (
    <Tag className={`font-title leading-19 uppercase  ${className}`}>
      {highlightText(text)}
    </Tag>
  );
};

export default Heading;
