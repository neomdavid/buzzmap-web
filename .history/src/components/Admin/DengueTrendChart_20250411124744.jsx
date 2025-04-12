import { Card, Title, BarChart } from "@tremor/react";
import { useEffect } from "react";

const DengueTrendChart = () => {
  const rawData = [
    { week: "Week 1", cases: 18 },
    { week: "Week 2", cases: 32 },
    { week: "Week 3", cases: 51 },
    { week: "Week 4", cases: 47 },
    { week: "Week 5", cases: 22 },
    { week: "Week 6", cases: 55 },
  ];

  const classifyRisk = (cases) => {
    if (cases >= 50) return "high";
    if (cases >= 30) return "medium";
    return "low";
  };

  // Transform data to have separate categories per risk level
  const data = rawData.map((item) => {
    const risk = classifyRisk(item.cases);
    return {
      week: item.week,
      low: risk === "low" ? item.cases : 0,
      medium: risk === "medium" ? item.cases : 0,
      high: risk === "high" ? item.cases : 0,
    };
  });

  useEffect(() => {
    console.log("Transformed Data:", data);
  }, []);

  return (
    <Card>
      <Title>Dengue Cases Trend (Last 6 Weeks)</Title>
      <BarChart
        className="mt-4 h-120"
        data={data}
        index="week"
        categories={["low", "medium", "high"]}
        colors={["emerald", "amber", "rose"]}
        yAxisWidth={50}
      />
    </Card>
  );
};

export default DengueTrendChart;
