const ActionPlanCard = ({
  title,
  items = [],
  borderColor = "border-l-primary",
}) => {
  return (
    <div className="flex flex-col">
      <div
        className={`flex flex-col gap-y-2 bg-white border-l-7 py-4 px-8 rounded-3xl shadow-sm ${borderColor}`}
      >
        <p className="text-xl text-base-content font-semibold mb-1">{title}</p>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between w-full text-black text-md"
          >
            <p className="">{item.event}</p>
            <p className="ml-3 text-nowrap text-base-content font-bold">
              {item.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionPlanCard;
