import { Card, Title, LineChart } from "@tremor/react";

const data = [
  {
    date: "Week 1",
    cases: 10,
  },
  {
    date: "Week 2",
    cases: 20,
  },
  {
    date: "Week 3",
    cases: 15,
  },
  {
    date: "Week 4",
    cases: 30,
  },
];

export default function DengueChartCard() {
  return (
    <Card>
      <Title className="font-extrabold">Dengue Cases - April</Title>
      <LineChart
        className=" h-50" // Check this for enough height
        data={data}
        index="date"
        categories={[" cases"]}
        colors={["primary"]}
        yAxisWidth={40}
      />
    </Card>
  );
}
