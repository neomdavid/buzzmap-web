import React from "react";

const Heading = ({ text = "", className = "" }) => {
  const highlightText = (text) => {
    if (typeof text !== "string") return text; // Prevents errors if `text` is undefined or not a string
    const parts = text.split(/\/(.*?)\//g); // Splits text by '/' and captures words inside '/'
    return parts.map((part, index) =>
      index % 2 === 1 ? ( // Words inside '/' will be at odd indices
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

  return (
    <h1 className={`font-title uppercase text-6xl ${className}`}>
      {highlightText(text)}
    </h1>
  );
};

export default Heading;
