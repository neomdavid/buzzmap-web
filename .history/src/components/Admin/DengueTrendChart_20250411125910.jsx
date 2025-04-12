import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, Title } from "@tremor/react"; // Optional for styling
import { useEffect } from "react";

const DengueTrendChart = () => {
  const rawData = [
    { week: "Week 1", cases: 400 },
    { week: "Week 2", cases: 1200 },
    { week: "Week 3", cases: 2600 },
    { week: "Week 4", cases: 2700 },
    { week: "Week 5", cases: 3100 },
    { week: "Week 6", cases: 2400 },
  ];

  const getColor = (cases) => {
    if (cases >= 2500) return "#ef4444"; // Red (High risk)
    if (cases >= 1000) return "#fbbf24"; // Yellow (Moderate)
    return "#10b981"; // Green (Low risk)
  };

  const data = rawData.map((item) => ({
    ...item,
    fill: getColor(item.cases),
  }));

  useEffect(() => {
    console.log("Chart data:", data);
  }, []);

  return (
    <Card className="w-full">
      <Title className="text-base-content font-bold text-lg">
        Dengue Cases Trend (Last 6 Weeks)
      </Title>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="10%" barSize={60}>
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend
            payload={[
              { value: "Low risk", type: "square", color: "#10b981" },
              { value: "Moderate risk", type: "square", color: "#fbbf24" },
              { value: "High risk", type: "square", color: "#ef4444" },
            ]}
          />
          <Bar dataKey="cases" fill="#000" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DengueTrendChart;
