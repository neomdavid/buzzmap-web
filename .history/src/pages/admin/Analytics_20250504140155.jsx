import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { alerts } from "../../utils";
import { AlertCard, DengueTrendChart } from "../../components";
import { ArrowUp, ArrowDown } from "phosphor-react";

const Analytics = () => {
  const swiperRef = useRef(null);

  const handlePrev = () => {
    swiperRef.current?.swiper?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.swiper?.slideNext();
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
            <p className="mb-2 text-base-content text-4xl font-bold">
              Pattern Recognition Alerts
            </p>

            <div className="flex gap-4 h-[360px]">
              {" "}
              {/* Increased height to accommodate spacing */}
              {/* Swiper Carousel */}
              <div className="flex-1">
                <Swiper
                  direction="vertical"
                  slidesPerView={4}
                  spaceBetween={2}
                  loop={false}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  ref={swiperRef}
                  className="h-full"
                >
                  {alerts.map((alert, index) => (
                    <SwiperSlide key={index} className="!h-auto">
                      {" "}
                      {/* Allow slides to respect spacing */}
                      <div className="pb-4 h-full">
                        {" "}
                        {/* Added padding bottom for spacing */}
                        <AlertCard {...alert} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              {/* Navigation Buttons */}
              <div className="flex flex-col justify-center gap-2">
                <button
                  onClick={handlePrev}
                  className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 focus:outline-none transition-colors"
                  aria-label="Scroll up"
                >
                  <ArrowUp size={20} />
                </button>
                <button
                  onClick={handleNext}
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
