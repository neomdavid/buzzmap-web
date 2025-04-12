const AlertCard = ({
  title,
  messages = [],
  borderColor = "border-error",
  bgColor = "bg-error",
}) => {
  return (
    <div
      className={`relative border-[2px] ${borderColor} rounded-4xl p-4 pt-10 text-black`}
    >
      <p
        className={`absolute text-lg left-[-2px] top-[-6px] text-nowrap ${bgColor} rounded-2xl font-semibold text-white p-1 px-4`}
      >
        {title}
      </p>
      {messages.map((msg, index) => (
        <p key={index}>
          <span className="font-bold">{msg.label}</span> {msg.text}
        </p>
      ))}
      <div className="flex justify-end mt-1">
        <button className="text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95">
          View Details
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
