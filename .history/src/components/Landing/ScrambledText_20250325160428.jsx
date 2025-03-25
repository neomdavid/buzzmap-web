const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block font-[Koulen] text-7xl tracking-wider ${
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
