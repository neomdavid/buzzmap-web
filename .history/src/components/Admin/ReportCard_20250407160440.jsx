import { FileText, MessageSquare } from "lucide-react";

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
        className={`flex flex-col ${topBg} text-white rounded-3xl py-6 pb-3 px-8`}
      >
        <p className="text-xl">{title}</p>
        <h1 className="text-8xl">{count}</h1>
      </div>

      <div className="flex flex-col bg-base-200 rounded-3xl gap-y-3 px-8 py-4 pt-15 mt-[-34px] z-[-4]">
        {type === "status" &&
          items.map((item, i) => (
            <div className="flex items-center gap-x-3" key={i}>
              <div className={`h-4 w-4 rounded-full ${item.color}`} />
              <p className="text-primary">
                <span className="font-semibold">{item.value}</span> {item.label}
              </p>
            </div>
          ))}

        {type === "interventions" &&
          items.map((item, i) => (
            <div className="flex items-center gap-x-3" key={i}>
              <div className="h-2 w-2 rounded-full bg-primary" />
              <p className="text-primary">{item.label}</p>
            </div>
          ))}

        {type === "engagement" &&
          items.map((item, i) => (
            <div className="flex items-center gap-x-3" key={i}>
              {item.label === "Reports" ? (
                <FileText size={16} className="text-primary" />
              ) : (
                <MessageSquare size={16} className="text-primary" />
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
