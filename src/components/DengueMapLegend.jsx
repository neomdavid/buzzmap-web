import { useState } from "react";
import Draggable from "react-draggable";
import {
    IconChartAreaLine,
    IconArrowUpRight,
    IconArrowDownRight,
    IconMinus,
    IconAlertCircle,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";

const patternLegends = [
  {
    label: "Spike",
    icon: <IconChartAreaLine size={22} className="text-error" />,
    color: "bg-error/10 border-error",
  },
  {
    label: "Gradual Rise",
    icon: <IconArrowUpRight size={22} className="text-warning" />,
    color: "bg-warning/10 border-warning",
  },
  {
    label: "Decline",
    icon: <IconArrowDownRight size={22} className="text-success" />,
    color: "bg-success/10 border-success",
  },
  {
    label: "Stability",
    icon: <IconMinus size={22} className="text-info" />,
    color: "bg-info/10 border-info",
  },
  {
    label: "No Pattern / No Data",
    icon: <IconAlertCircle size={22} className="text-gray-400" />,
    color: "bg-gray-100 border-gray-400",
  },
];

export default function DengueMapLegend() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      {/* Show button when legend is hidden */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <IconChevronRight size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Show Legends</span>
        </button>
      )}

      {/* Legend content */}
      <Draggable
        handle=".drag-handle"
        bounds="parent"
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
      >
        <div 
          className={`absolute top-4 left-4 z-10 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        >
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-4 flex flex-col gap-3 max-w-xs">
            <div className="drag-handle cursor-move flex justify-between items-center mb-2">
              <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto"></div>
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors"
              >
                <IconChevronLeft size={16} className="text-gray-600" />
              </button>
            </div>

            <div>
              <p className="font-bold text-base mb-2 text-primary">Pattern Recognition</p>
              <div className="grid grid-cols-1 gap-2">
                {patternLegends.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${item.color} shadow-sm`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Draggable>
    </>
  );
}