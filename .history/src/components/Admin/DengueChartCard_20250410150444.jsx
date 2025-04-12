import { Card, Title, LineChart } from "@tremor/react";

const data = [
  {
    date: "2025-04-01",
    cases: 10,
  },
  {
    date: "2025-04-02",
    cases: 20,
  },
  {
    date: "2025-04-03",
    cases: 15,
  },
  {
    date: "2025-04-04",
    cases: 30,
  },
];

export default function DengueChartCard() {
  return (
    <Card>
      <Title>Dengue Cases - April</Title>
      <LineChart
        className="mt-4 h-50" // Check this for enough height
        data={data}
        index="date"
        categories={["cases"]}
        colors={["primary"]}
        yAxisWidth={40}
      />
    </Card>
  );
}
