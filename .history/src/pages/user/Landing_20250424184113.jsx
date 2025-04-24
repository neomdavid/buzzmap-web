import patient1 from "../../assets/dengue-patient-1.jpg";
import tubImg from "../../assets/mosquito_tub.jpg";
import cleaningImg from "../../assets/cleaning.jpg";
import logoFooter from "../../assets/logo_ligthbg.svg";
import logoSurveillance from "../../assets/icons/quezon_surveillance.png";
import {
  GoalCard,
  Heading,
  PreventionCard,
  SecondaryButton,
} from "../../components";
import {
  ArrowRight,
  LockKey,
  HandPointing,
  UsersThree,
  Bug,
  ShieldCheck,
  Heartbeat,
  Quotes,
} from "phosphor-react";
import ScrambledText from "../../components/Landing/ScrambledText";
import AltPreventionCard from "../../components/Landing/AltPreventionCard";
import { Link } from "react-router-dom";
import DengueMap from "../../components/DengueMap";
import StreetViewMap from "../../components/StreetViewMap";

const Landing = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded) {
      setMapLoaded(true);
    }
  }, [isLoaded]);
  return (
    <main className="flex flex-col overflow-hidden mt-12">
      {/* <StreetViewMap /> */}
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-7xl  px-10 mb-10 lg:max-w-[80vw] lg:items-center lg:self-center text-center">
        <Heading
          className="text-[46px] text-left sm:text-7xl md:text-8xl md:leading-24 lg:-translate-x-50 xl:-translate-x-50 xl:text-9xl xl:leading-40"
          text="Buzzing /with awareness/"
        />
        <Heading
          className="text-[46px] mt-[-17px] sm:mt-0 text-right sm:text-7xl md:text-8xl lg:translate-x-50 xl:translate-x-50 xl:text-9xl"
          text="Mapping /for prevention/"
        />
      </div>

      <div className="text-primary text-center font-semibold mb-8">
        <h3 className="text-xl italic uppercase font-bold mb-2 font-[Inter]">
          Stay protected from dengue.
        </h3>
        <p className="px-10">
          Join the community in&nbsp;
          <span className="font-bold italic">
            mapping dengue hotspots, sharing reports,
          </span>{" "}
          and&nbsp;
          <span className="font-bold italic">
            preventing outbreaks together.
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row w-[80%] m-auto mt-2  gap-x-3 justify-center items-center">
        <SecondaryButton text={"Check Dengue Hotspots"} className="w-md " />
        <SecondaryButton text={"Report a Dengue Case"} className="w-md " />
        <SecondaryButton text={"Get Prevention Tips"} className="w-md " />
      </div>

      <img
        src={patient1}
        className="h-[380px] lg:h-[420px] xl:h-[440px] object-cover rounded-3xl  mx-auto mt-[-60px] z-[-1] mb-8 max-w-[95vw] w-full px-6 sm:px-6"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 60%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,1) 60%)",
        }}
      />

      <section className="flex flex-col lg:flex-row  justify-center max-w-[95vw] m-auto px-6 sm:px-6 gap-x-4">
        <div className="rounded-xl overflow-hidden h-[400px] lg:h-[500px] mb-6 lg:mb-0 lg:flex-1 flex items-center justify-center bg-gray-100">
          {mapLoaded ? (
            <DengueMap
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
              }}
            />
          ) : (
            <div className="text-center p-4">
              <p>Loading map...</p>
              <p className="text-sm text-gray-500">This may take a moment</p>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-10  mx-6 items-center text-center lg:items-end lg:text-right">
          <Heading
            text="see the /danger zones/"
            className="text-5xl sm:text-6xl"
          />
          <p className="text-primary text-xl font-semibold mt-5">
            By tracking and visualizing dengue hotspots, users can stay
            informed, take preventive actions, and avoid high-risk areas,
            ultimately reducing their chances of exposure and contributing to
            the fight against dengue.
          </p>
          <br />
          <p className="text-primary text-md mb-6">
            BuzzMap’s dengue mapping feature uses real-time crowdsourced data to
            track and visualize dengue outbreaks in your area. Users report
            dengue cases and mosquito breeding sites, which are then plotted on
            an interactive map. This helps the community stay informed, identify
            hotspots, and take proactive steps to prevent the spread of dengue.
          </p>
          <SecondaryButton
            text="Explore the Dengue Map"
            maxWidth={"max-w-[230px]"}
            Icon={ArrowRight}
          />
          <div className="flex flex-col  sm:flex-row justify-around gap-4 w-full mt-8">
            <GoalCard
              Icon={LockKey}
              title="Confidentiality"
              text="BuzzMap ensures that all user-reported data is kept secure and anonymous to protect your privacy while contributing to health efforts."
              bgColor="bg-primary"
            />
            <GoalCard
              Icon={HandPointing}
              title="Accessibility"
              text="User-friendly and accessible on both mobile and desktop, ensuring everyone can contribute to dengue prevention."
              bgColor="light"
            />
            <GoalCard
              Icon={UsersThree}
              title="Community"
              text="Users can share information, support each other, and work together to combat dengue outbreaks."
              bgColor="bg-primary"
            />
          </div>
        </div>
      </section>
      <article className="bg-primary mt-8 flex flex-col items-center py-20">
        <h1 className="uppercase text-5xl sm:text-6xl text-white">
          DON'T WAIT FOR AN
        </h1>
        <ScrambledText text="outbreak!" />
        <p className="italic text-white mt-8 mb-8">
          Take Action with These Prevention Tips
        </p>
        <div className="grid grid-cols-2 md:flex justify-center flex-wrap gap-6 px-4">
          <PreventionCard
            title="Eliminate Mosquito Breeding Sites"
            category="Control and Sanitation"
            bgImg={tubImg}
            to="/prevention/details"
          />
          <AltPreventionCard
            title="Personal Protection Measures"
            subtext="Using repellents, wearing protective clothing, and installing mosquito screens."
            category="Sanitation"
            Icon={ShieldCheck}
            iconSize={115}
            iconPosition="top-[-15px] right-[-20px] xl:top-[-46px] xl:right-[-27px]"
            iconRotation={-15}
            titlePosition="top-30 left-8 lg:top-37 lg:left-10 xl:top-37 xl:left-11.5 2xl:top-46 2xl:left-14"
            subtextPosition="top-57 left-8 lg:top-67 lg:left-12.5 xl:top-72 xl:left-14 2xl:top-82 2xl:left-16.5"
            categoryPosition="top-20 left-8 lg:top-26 lg:left-12.5 xl:top-26 xl:left-13 2xl:top-33 2xl:left-15"
            bgColor="bg-secondary"
            to="/sanitation"
          />
          <AltPreventionCard
            title="Recognizing Dengue Symptoms Early"
            subtext="Common signs of dengue and when to seek medical help."
            category="Awareness & Detection"
            Icon={Heartbeat}
            iconSize={115}
            iconPosition="bottom-[-30px] left-5 xl:bottom-[-45px] xl:left-0"
            iconRotation={-15}
            titlePosition="top-18 left-0 lg:top-24.5 xl:left-2 2xl:top-39"
            subtextPosition="top-53 left-9.5 lg:top-63.5  lg:left-18 xl:left-26.5 xl:top-72.5 2xl:top-87.5 2xl:left-27.5 "
            categoryPosition="top-6 left-[40px] lg:left-21.5 lg:top-13.5 lg:left-26.5 lg:top-13.5 2xl:top-27 2xl:left-29"
            bgColor="bg-base-200"
            to="/sanitation"
            titleAlign="center"
            subtextAlign="center"
          />
          <PreventionCard
            title="Community Efforts to Prevent Dengue"
            category="Community"
            bgImg={cleaningImg}
            to="/prevention/details"
          />
        </div>
        <Link
          to="/prevention"
          className="flex font-normal underline italic justify-center items-center gap-x-2 text-white mt-12"
        >
          <p>View more prevention and tips here</p>
          <ArrowRight />
        </Link>
      </article>
      <article
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 75%)",
        }}
        className="z-20 bg-primary mt-[-5px] pt-22 pb-50 w-full flex justify-center text-7xl md:text-8xl items-center flex-col text-white"
      >
        <p className=" relative">
          Speak up, stay
          <Quotes
            className="absolute left-[-110px] top-[-80px] sm:left-[-190px] sm:top-[-30px] rotate-183"
            weight="fill"
            size={90}
          />
          <Quotes
            className="absolute right-[-100px] bottom-[-275px] sm:right-[-215px] sm:bottom-[-287px] rotate-2"
            weight="fill"
            size={160}
          />
        </p>
        <p>
          safe<span className="font-bold italic">—let’s fight</span>
        </p>
        <p className="font-bold italic">dengue together!</p>
      </article>
      <footer className="flex  text-primary justify-between px-6 py-10 sm:py-6 pb-12 mt-[-25px] w-full  mr-6">
        <div className="flex gap-x-16">
          <div className="flex gap-x-6 items-center">
            <img src={logoFooter} className="w-28 sm:w-33 h-auto" />
            <img src={logoSurveillance} className="w-28 sm:w-33  h-auto" />
          </div>

          <div className="flex flex-col gap-y-6 text-sm ">
            <div className="flex flex-col">
              <p>
                <span className="font-bold">Address: </span>National University
                - Manila
              </p>
              <p>
                <span className="font-bold">E-mail: </span>buzzmap@gmail.com
              </p>
            </div>
            <div className="flex flex-col">
              <p>Terms of Service</p>
              <p>Privacy Policy</p>
              <p>Data Protection Policy</p>
            </div>
          </div>
        </div>

        <div className="font-bold self-end text-sm">©2025</div>
      </footer>
    </main>
  );
};

export default Landing;
