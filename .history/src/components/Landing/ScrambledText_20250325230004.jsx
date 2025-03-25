const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block text-white font-[Koulen] text-8xl sm:text-9xl tracking-[12px] drop-shadow-2xl
                ${
                  index % 2 === 0
                    ? "-rotate-7 -translate-y-1"
                    : "rotate-7 translate-y-1"
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
