import { IconCheck, IconHourglassEmpty, IconSearch } from "@tabler/icons-react";
import { ActionPlanCard } from "../../components";

const iconMap = {
  done: (
    <div className="rounded-full bg-success p-0.5">
      <IconCheck size={12} color="white" stroke={4} />
    </div>
  ),
  result: (
    <div className="text-primary">
      <IconSearch size={16} stroke={2} />
    </div>
  ),
  pending: (
    <div className="text-warning">
      <IconHourglassEmpty size={16} stroke={2} />
    </div>
  ),
};

const ProgressCard = ({
  title,
  date,
  progress = 0,
  statusColor = "bg-info",
  items = [],
  onEdit,
}) => {
  return (
    <div className="flex flex-col gap-1.5 bg-white py-4 px-6 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center gap-x-3">
          <div className={`w-5 h-5 ${statusColor} rounded-full`} />
          <p>{title}</p>
          <p className="text-base-content font-bold">{date}</p>
        </div>
        <p className="text-primary font-semibold">{progress}%</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-7 rounded-full my-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Items with Edit Button on Last */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div className="flex justify-between items-center" key={index}>
              <div className="flex items-center gap-x-3">
                {iconMap[item.type]}
                <p className="text-gray-500">{item.label}</p>
              </div>
              {isLast && (
                <button
                  className="text-xs text-nowrap bg-base-content text-white font-light px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95"
                  onClick={onEdit}
                >
                  Edit Action Plan Progress
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressCard;
