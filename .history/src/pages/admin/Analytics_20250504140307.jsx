import { alerts } from "../../utils";
import { AlertCard, DengueTrendChart } from "../../components";
import { ArrowUp, ArrowDown } from "phosphor-react";
import { useRef } from "react";
const Analytics = () => {
  const alertsContainerRef = useRef(null);

  const scrollUp = () => {
    alertsContainerRef.current?.scrollBy({ top: -200, behavior: "smooth" });
  };

  const scrollDown = () => {
    alertsContainerRef.current?.scrollBy({ top: 200, behavior: "smooth" });
  };

  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Analytics
      </p>
      <article className="flex flex-col">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 shadow-sm shadow-lg p-6 py-8 rounded-lg">
          <section className="flex flex-col lg:col-span-7">
            <p className="mb-4 text-base-content text-4xl font-bold">
              Trends and Patterns
            </p>
            <div className="mt-[-14px] ml-[-12px]">
              <DengueTrendChart />
            </div>
          </section>

          <section className="flex flex-col lg:col-span-5">
            <p className="mb-4 text-base-content text-4xl font-bold">
              Pattern Recognition Alerts
            </p>

            <div className="flex gap-4 h-[360px]">
              {/* Scrollable alerts container */}
              <div
                ref={alertsContainerRef}
                className="flex-1 overflow-y-auto pr-2 space-y-4" // Added space between cards
              >
                {alerts.map((alert, index) => (
                  <AlertCard key={index} {...alert} />
                ))}
              </div>

              {/* Scroll buttons */}
              <div className="flex flex-col justify-center gap-2">
                <button
                  onClick={scrollUp}
                  className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 focus:outline-none transition-colors"
                  aria-label="Scroll up"
                >
                  <ArrowUp size={20} />
                </button>
                <button
                  onClick={scrollDown}
                  className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 focus:outline-none transition-colors"
                  aria-label="Scroll down"
                >
                  <ArrowDown size={20} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};

export default Analytics;
