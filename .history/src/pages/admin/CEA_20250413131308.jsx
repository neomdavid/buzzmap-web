import { DengueChartCard, DengueTrendChart } from "../../components";
const CEA = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        {
          id: "728ed52f",
          amount: 100,
          status: "pending",
          email: "m@example.com",
        },
        {
          id: "489e1d42",
          amount: 125,
          status: "processing",
          email: "example@gmail.com",
        },
      ]);
    }, 1000);
  }, []);
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center bg-red-100 text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <div className="flex w-full h-100">
        <DengueChartCard />
      </div>
    </main>
  );
};

export default CEA;
