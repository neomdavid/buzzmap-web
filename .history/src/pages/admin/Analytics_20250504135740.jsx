import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper components
import "swiper/css"; // Import Swiper styles
import "swiper/css/navigation"; // Import navigation styles
import { alerts } from "../../utils";
import { AlertCard, DengueTrendChart } from "../../components"; // Import the AlertCard component
import { Check, ArrowUp, ArrowDown } from "phosphor-react"; // Import icons

const Analytics = () => {
  const swiperRef = useRef(null); // Reference to the Swiper instance

  // Handle the up and down button clicks to control the swiper
  const handlePrev = () => {
    swiperRef.current.swiper.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current.swiper.slideNext();
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

          <section className="flex flex-col lg:col-span-5 gap-y-5">
            <p className="mb-2 text-base-content text-4xl font-bold">
              Pattern Recognition Alerts
            </p>

            {/* Swiper Carousel for vertical scrolling */}
            <Swiper
              direction="vertical" // Set the carousel to scroll vertically
              slidesPerView={3} // Show 3 slides at a time
              spaceBetween={20} // Add space between the slides vertically
              loop={false} // Disable looping back to the start
              autoplay={{ delay: 3000 }} // Auto-play every 3 seconds
              ref={swiperRef} // Attach the swiper reference
              className="w-full h-[300px]" // Set height for the swiper container
            >
              {alerts.map((alert, index) => (
                <SwiperSlide key={index}>
                  <AlertCard {...alert} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <div className="flex flex-col justify-between mt-4 h-full">
              <button
                onClick={handlePrev}
                className="bg-primary text-white p-3 rounded-full hover:bg-primary/80 focus:outline-none mb-2"
                aria-label="Scroll up"
              >
                <ArrowUp size={24} /> {/* Up Arrow Icon */}
              </button>
              <button
                onClick={handleNext}
                className="bg-primary text-white p-3 rounded-full hover:bg-primary/80 focus:outline-none mt-2"
                aria-label="Scroll down"
              >
                <ArrowDown size={24} /> {/* Down Arrow Icon */}
              </button>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};

export default Analytics;
