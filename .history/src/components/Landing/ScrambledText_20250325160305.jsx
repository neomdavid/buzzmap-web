const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block ${
            index % 2 === 0 ? "rotate-5" : "-rotate-5"
          }`}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
