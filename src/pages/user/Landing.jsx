import patient1 from "../../assets/dengue-patient-1.jpg";
import tubImg from "../../assets/mosquito_tub.jpg";
import cleaningImg from "../../assets/cleaning.jpg";
import logoFooter from "../../assets/logo_ligthbg.svg";
import logoSurveillance from "../../assets/icons/quezon_surveillance.png";
import profile1 from "../../assets/profile1.png";

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
  ArrowFatLineRight,
} from "phosphor-react";
import ScrambledText from "../../components/Landing/ScrambledText";
import AltPreventionCard from "../../components/Landing/AltPreventionCard";
import { Link } from "react-router-dom";
import StreetViewMap from "../../components/StreetViewMap";
import { useState, useEffect, useRef } from "react";
import { useGoogleMaps } from "../../components/GoogleMapsProvider.jsx";
import Mapping from "./Mapping";
import RiskMap from "../../components/RiskMap";
import NewPostModal from "../../components/Community/NewPostModal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toastInfo, toastSuccess } from "../../utils";

const Landing = () => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // If there's a user in Redux state, use that
      if (user) {
        console.log("[DEBUG] Landing - Redirecting based on Redux user role:", user.role);
        switch (user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "superadmin":
            navigate("/superadmin/users");
            break;
          case "user":
            // Stay on landing page for regular users
            break;
          default:
            break;
        }
      } else {
        // If no user in Redux but token exists, try to get user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("[DEBUG] Landing - Redirecting based on localStorage user role:", parsedUser.role);
          switch (parsedUser.role) {
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "superadmin":
              navigate("/superadmin/users");
              break;
            case "user":
              // Stay on landing page for regular users
              break;
            default:
              break;
          }
        }
      }
    }
  }, [navigate, user]);

  const handleReportClick = () => {
    // Check if user exists and has a name property
    if (!user || user.name === "Guest") {
      // Show toast message instead of navigating directly
      toastInfo("Please log in to share your report");
      // Optional: navigate to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      // If user is logged in, open the modal
      if (modalRef.current) {
        modalRef.current.showModal();
      }
    }
  };

  return (
    <main className="flex flex-col overflow-hidden mt-12">
      {/* <StreetViewMap /> */}
      <div className="text-primary font-[Koulen] uppercase flex flex-col text-7xl  px-10 mb-14 lg:max-w-[80vw] lg:items-center lg:self-center text-center">
        <Heading
          className="text-[46px] text-left sm:text-7xl md:text-8xl md:leading-24 lg:-translate-x-50 xl:-translate-x-50 xl:text-9xl xl:leading-40"
          text="Buzzing /with awareness/"
        />
        <Heading
          className="text-[46px] mt-[-17px] sm:mt-0 text-right sm:text-7xl md:text-8xl lg:translate-x-50 xl:translate-x-50 xl:text-9xl"
          text="Mapping /for prevention/"
        />
      </div>

      <div className="text-primary text-center text-xl font-semibold mb-8">
        <h3 className="text-2xl italic uppercase font-bold mb-10 font-[Inter]">
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
      <div className="flex flex-col gap-4 sm:flex-row w-[80%] m-auto mt-2 gap-x-3 justify-center items-center">
        <SecondaryButton text={"Check Dengue Hotspots"} to="/mapping" className="w-md " />
        <SecondaryButton text={"Report a Breeding Site"} to="/community" className="w-md " />
        <SecondaryButton text={"Get Prevention Tips"} to="/buzzline" className="w-md " />
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
        <div className="rounded-xl overflow-hidden h-[400px] lg:h-[500px] mb-6 lg:mb-0 lg:flex-13 flex items-center justify-center bg-gray-100">
          <RiskMap height="400px" />
        </div>
        <div className="mb-16 flex flex-col flex-10  mx-6 items-center text-center lg:items-end lg:text-right">
          <Heading
            text="see the /danger zones/"
            className="text-5xl sm:text-7xl"
          />
          <p className="text-primary text-xl font-semibold mt-5">
            By tracking and visualizing dengue hotspots, users can stay
            informed, take preventive actions, and avoid high-risk areas,
            ultimately reducing their chances of exposure and contributing to
            the fight against dengue.
          </p>
          <br />
          <p className="text-primary text-lg mb-6">
            BuzzMap's dengue mapping feature uses real-time crowdsourced data to
            track and visualize dengue outbreaks in your area. Users report
            dengue cases and mosquito breeding sites, which are then plotted on
            an interactive map. This helps the community stay informed, identify
            hotspots, and take proactive steps to prevent the spread of dengue.
          </p>
          <SecondaryButton
            text="Explore the Dengue Map"
            maxWidth={"max-w-[230px]"}
            Icon={ArrowRight}
            to="/mapping"
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
      <div className="flex flex-col text-center items-center mx-14  p-10 py-16 bg-gradient-to-r from-[#245261] to-[#4AA8C7] text-white rounded-2xl my-10">
        <h1 className="text-5xl sm:text-7xl mb-2">YOUR COMMUNITY SPEAKS</h1>
        <p className="font-bold italic mb-8 text-lg">Spread Awareness. Check the Latest Dengue Updates! </p>
        <div
          className="flex items-center justify-center sm:w-[60%] max-w-[600px] px-10 py-5 bg-white rounded-2xl gap-3 mb-8 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleReportClick}
        >
          <img src={profile1} className="h-12 w-12 rounded-full" />
          <input
            type="text"
            placeholder={!user || user.name === "Guest" ? "Login to share your report..." : "Share your report here..."}
            className="flex-1 input input-lg my-1 text-lg rounded-2xl input-primary placeholder:text-primary placeholder:italic"
            readOnly
          />
          <div className="text-primary ml-[-3px]">
            <ArrowFatLineRight size={25} weight="fill" />
          </div>
        </div>
        <Link to="/community" className="bg-gradient-to-b from-[#FADD37] to-[#F8A900] italic text-primary font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-300 active:opacity-70 hover:cursor-pointer text-lg">Read more dengue reports <span className="font-extrabold">here</span>.</Link>
      </div>
      <article className="bg-primary mt-8 flex flex-col items-center py-20">
        <h1 className="uppercase text-5xl sm:text-9xl text-white">
          WHAT'S THE BUZZ?
        </h1>
        {/* <ScrambledText text="outbreak!" /> */}
        <p className="italic text-lg text-white mt-4 mb-8">
          Stay updated and take action with these prevention tips from Quezon City Epidemiology and Surveillance Division.
        </p>
        {/* <div className="grid grid-cols-2 md:flex justify-center flex-wrap gap-6 px-4">
          <PreventionCard
            title="Eliminate Mosquito Breeding Sites"
            category="Control and Sanitation"
            bgImg={tubImg}
            to="/buzzline/details"
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
            to="/buzzline/details"
          />
        </div> */}
        {/* <Link
          to="/buzzline"
          className="flex font-normal underline italic justify-center items-center gap-x-2 text-white mt-12"
        >
          <p>View more prevention and tips here</p>
          <ArrowRight />
        </Link> */}
      </article>
      <article
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 75%)",
        }}
        className="z-20 bg-primary mt-[-5px] pt-22 pb-65 w-full flex justify-center text-7xl md:text-8xl items-center flex-col text-white"
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
          safe<span className="font-bold italic">—let's fight</span>
        </p>
        <p className="font-bold italic">dengue together!</p>
      </article>
      <footer className="flex  text-primary justify-between px-6 py-10 sm:py-6 pb-12 mt-[-25px] w-full  mr-6">
        <div className="flex gap-x-16">
          <div className="flex gap-x-6 items-center">
            <img src={logoFooter} className="w-28 sm:w-33 h-auto" />
            <img src={logoSurveillance} className="w-28 sm:w-33  h-auto" />
          </div>

          <div className="flex flex-col gap-y-6 text-md ">
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

        <div className="font-bold self-end text-md">©2025</div>
      </footer>
      <NewPostModal ref={modalRef} />
    </main>
  );
};

export default Landing;
