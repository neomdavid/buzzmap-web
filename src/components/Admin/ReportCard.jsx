import { ChatCenteredText, Warning } from "phosphor-react";
const ReportCard = ({
  title,
  count,
  type,
  items,
  topBg = "bg-primary-content",
}) => {
  return (
    <article className="flex flex-col">
      <div
        className={`flex flex-col shadow-sm ${topBg} text-white rounded-3xl py-6 pb-3 px-8 z-70`}
      >
        <p className="text-xl">{title}</p>
        <h1 className="text-8xl">{count}</h1>
      </div>

      <div className="flex flex-col shadow-md bg-base-200 rounded-3xl gap-y-3 px-8 py-4 pt-15 mt-[-34px] z-50">
        {type === "status" &&
          items.map((item, i) => (
            <div className="flex items-center gap-x-3" key={i}>
              <div className={`h-4 w-4 rounded-full ${item.color}`} />
              <p className="text-primary">
                <span className="font-semibold">{item.value || 0}</span>{" "}
                {item.label}
              </p>
            </div>
          ))}

        {type === "interventions" &&
          items.map((item, i) => (
            <div className="flex items-center gap-x-3" key={i}>
              <div className="h-2 w-2 rounded-full bg-primary" />
              <p className="text-primary leading-5">{item.label}</p>
            </div>
          ))}

        {type === "engagement" &&
          items.map((item, i) => (
            <div className="flex items-center gap-x-3" key={i}>
              {item.label === "Reports" ? (
                <Warning size={16} weight="fill" className="text-primary" />
              ) : (
                <ChatCenteredText
                  size={16}
                  weight="fill"
                  className="text-primary"
                />
              )}
              <p className="text-primary">
                <span className="font-semibold">{item.value}</span> {item.label}
              </p>
            </div>
          ))}
      </div>
    </article>
  );
};

export default ReportCard;
