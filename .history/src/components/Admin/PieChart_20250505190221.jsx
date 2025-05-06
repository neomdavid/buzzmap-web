import React from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { Legend } from "@visx/legend";
import { scaleOrdinal } from "@visx/scale";

const PieChart = ({ width = 400, height = 400 }) => {
  const data = [
    { label: "Stagnant water", value: 40, color: "#00b0b9" },
    { label: "Improper waste disposal", value: 25, color: "#00a0c6" },
    { label: "Uncovered containers", value: 15, color: "#006aa7" },
    { label: "High vegetation density", value: 10, color: "#66b2c6" },
    { label: "Abandoned structures", value: 5, color: "#3c7289" },
  ];

  const colorScale = scaleOrdinal({
    domain: data.map((d) => d.label),
    range: data.map((d) => d.color),
  });

  const radius = Math.min(width, height) / 2;
  const centerY = height / 2;
  const centerX = width / 2;
  const pieWidth = radius * 2;
  const pieHeight = radius * 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height}>
        <Group top={centerY} left={centerX}>
          <Pie
            data={data}
            pieValue={(d) => d.value}
            outerRadius={radius - 10}
            innerRadius={radius - 30}
            cornerRadius={3}
            padAngle={0.01}
          >
            {(pie) => {
              return pie.arcs.map((arc, index) => {
                const [centroidX, centroidY] = pie.path.centroid(arc);
                const arcPath = pie.path(arc);
                const arcFill = colorScale(arc.data.label);

                return (
                  <g key={`arc-${arc.data.label}-${index}`}>
                    <path d={arcPath} fill={arcFill} />
                    <Text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fontSize={12}
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="white"
                    >
                      {`${arc.data.value}%`}
                    </Text>
                  </g>
                );
              });
            }}
          </Pie>
        </Group>
      </svg>

      <div className="mt-4">
        <Legend
          scale={colorScale}
          labelFormat={(label) => (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
        />
      </div>
    </div>
  );
};

export default PieChart;
