const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block font-[Koulen] text-7xl tracking-widest
              ${
                index % 2 === 0
                  ? "-rotate-7 -translate-x-1"
                  : "rotate-7 translate-y-1 "
              }
            `}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
