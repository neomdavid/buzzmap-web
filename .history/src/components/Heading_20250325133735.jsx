import React from "react";

const BuzzMapHeading = ({ text }) => {
  const highlightText = (text) => {
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
    <h1 className="font-title uppercase text-7xl">{highlightText(text)}</h1>
  );
};

export default BuzzMapHeading;
