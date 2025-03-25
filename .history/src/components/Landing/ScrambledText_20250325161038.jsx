const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block text-white font-[Koulen] text-8xl tracking-[12px]
                ${
                  index % 2 === 0
                    ? "-rotate-7 -translate-y-1"
                    : "rotate-7 translate-y-1"
                }
                shadow-[4px_4px_0px_rgba(0,0,0,0.8)] 
              `}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
