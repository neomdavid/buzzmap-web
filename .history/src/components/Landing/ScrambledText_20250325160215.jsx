const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block ${
            index % 2 === 0 ? "rotate-20" : "-rotate-20"
          }`}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
