import { Card, Title, LineChart } from "@tremor/react"; // Import LineChart instead of AreaChart

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
        className="mt-4 h-72"
        data={data}
        index="date"
        categories={["cases"]}
        colors={["rose"]}
        yAxisWidth={40}
      />
    </Card>
  );
}
