const ScrambledText = ({ text }) => {
  return (
    <span className="inline-flex">
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block text-white font-[Koulen] text-8xl tracking-[12px] drop-shadow-2xl
                  ${
                    index % 2 === 0
                      ? "-rotate-7 -translate-y-1"
                      : "rotate-7 translate-y-1"
                  }
                `}
          style={{
            textShadow: `
                -2px -2px 0 black,  
                 2px -2px 0 black,  
                -2px  2px 0 black,  
                 2px  2px 0 black,  
                -2px  0px 0 black,  
                 2px  0px 0 black,  
                 0px -2px 0 black,  
                 0px  2px 0 black
              `,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
