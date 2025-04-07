import { LucideMessageCircle, LucideFileText } from "lucide-react";

/**
 * @typedef {Object} StatusItem
 * @property {string} label - The label for the item
 * @property {number} [value] - Optional number value
 * @property {string} [color] - Optional color class (used for status type)
 *
 * @typedef {"status" | "interventions" | "engagement"} StatusType
 */

/**
 * @param {{
 *  title: string,
 *  count: number,
 *  type: StatusType,
 *  items: StatusItem[]
 * }} props
 */
export default function ReportCard({ title, count, type, items }) {
  const renderItem = (item, index) => {
    switch (type) {
      case "status":
        return (
          <div key={index} className="flex items-center gap-x-3">
            <div className={`h-4 w-4 rounded-full ${item.color}`} />
            <p className="text-primary">
              <span className="font-semibold">{item.value}</span> {item.label}
            </p>
          </div>
        );
      case "interventions":
        return (
          <div key={index} className="flex items-center gap-x-3">
            <span className="text-primary text-xl leading-none">•</span>
            <p className="text-primary">{item.label}</p>
          </div>
        );
      case "engagement":
        const Icon =
          item.label === "Reports" ? LucideFileText : LucideMessageCircle;
        return (
          <div key={index} className="flex items-center gap-x-3">
            <Icon className="text-primary h-5 w-5" />
            <p className="text-primary">
              <span className="font-semibold">{item.value}</span> {item.label}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article className="flex flex-col">
      <div className="flex flex-col bg-primary-content text-white rounded-3xl py-6 pb-3 px-8">
        <p className="text-xl">{title}</p>
        <h1 className="text-8xl">{count}</h1>
      </div>
      <div className="flex flex-col bg-base-200 rounded-3xl gap-y-3 px-8 py-4 pt-15 mt-[-34px] z-[-4]">
        {items.map(renderItem)}
      </div>
    </article>
  );
}
