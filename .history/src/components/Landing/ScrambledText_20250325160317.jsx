const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block text-3xl ${
            index % 2 === 0 ? "rotate-7" : "-rotate-7"
          }`}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
