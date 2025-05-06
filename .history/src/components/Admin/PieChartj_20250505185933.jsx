import React from "react";
import { RadialChart } from "react-vis";

const PieChart = () => {
  const data = [
    { angle: 40, label: "Stagnant water", color: "#00b0b9" },
    { angle: 25, label: "Improper waste disposal", color: "#00a0c6" },
    { angle: 15, label: "Uncovered containers", color: "#006aa7" },
    { angle: 10, label: "High vegetation density", color: "#66b2c6" },
    { angle: 5, label: "Abandoned structures", color: "#3c7289" },
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-64 h-64">
        <RadialChart
          data={data}
          width={300}
          height={300}
          showLabels={true}
          colorType="literal"
          labelRadius={0.85}
          style={{
            labels: {
              fontSize: "12px",
              fontWeight: "bold",
            },
          }}
        />
      </div>
    </div>
  );
};

export default PieChart;
