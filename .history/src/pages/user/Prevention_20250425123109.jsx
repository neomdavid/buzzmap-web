import { Heading, PreventionCard, AltPreventionCard } from "../../components";
import sprayingAlcohol from "../../assets/sprayingalcohol.jpg";
import tubImg from "../../assets/mosquito_tub.jpg";
import cleaningImg from "../../assets/cleaning.jpg";
import {
  IconShieldCheck,
  IconUsersGroup,
  IconHomeFilled,
  IconHaze,
  IconAutomation,
} from "@tabler/icons-react";
import { ShieldCheck, Heartbeat, ArrowRight } from "phosphor-react";
const Prevention = () => {
  return (
    <main className="flex flex-col text-center items-center justify-center mt-2 py-8 overflow-x-hidden">
      <div className="mx-4">
        <Heading text="Stay one step /ahead/" className="text-8xl mb-4" />
        <p className="font-semibold text-xl">
          Read and View Smart Tips to Prevent Dengue and Protect Your Community
          Below
        </p>
      </div>

      <div className="relative mt-12 w-[112%] rounded-tl-[450px] rounded-tr-[450px] md:rounded-tl-[1000px] md:rounded-tr-[1000px] md:h-300 md:mb-[-450px] md:w-[120%] overflow-hidden">
        {/* Image */}
        <img className="w-full h-150 object-cover" src={sprayingAlcohol} />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/2 to-transparent  md:mt-[-850px]"></div>
      </div>
      <section className="px-12  py-14 pt-24 w-full bg-primary flex flex-col text-white items-start z-1000000000">
        <p className="font-bold italic text-3xl w-full text-center mb-8">
          Trending Articles
        </p>
        <div className="grid grid-cols-2 m-auto md:flex justify-center flex-wrap gap-6 px-4">
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
            iconPosition="top-[-15px] right-[-20px]"
            iconRotation={-15}
            titlePosition="top-30 left-8 lg:top-44 lg:left-10"
            subtextPosition="top-57 left-8 lg:top-77 lg:left-12.5"
            categoryPosition="top-25 left-8 lg:top-26 lg:left-12.5"
            bgColor="bg-secondary"
            to="/sanitation"
          />
          <AltPreventionCard
            title="Recognizing Dengue Symptoms Early"
            subtext="Common signs of dengue and when to seek medical help."
            category="Awareness & Detection"
            Icon={Heartbeat}
            iconSize={115}
            iconPosition="bottom-[-30px] left-5"
            iconRotation={-15}
            titlePosition="top-18 left-0 lg:top-24.5"
            subtextPosition="top-53 left-9.5 lg:top-63.5  lg:left-18"
            categoryPosition="top-6 left-[40px] lg:left-21.5 lg:top-13.5"
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
        <div className="flex justify-center m-auto  w-[93%] xl:w-[80%] mt-24">
          <figure className="hidden sm:flex flex-col bg-white p-8 pt-8 xl:pt-12 pb-0 border-red-100 rounded-xl w-[80%]">
            <p className="text-left text-primary mb-16 leading-10 xl:leading-12 text-6xl xl:text-7xl font-semibold ">
              Explore <br />
              <span className="translate-y-40 italic font-bold text-[49px] xl:text-[60px]">
                Interests
              </span>
            </p>
            {/* Did you know cards */}
            <section className="flex flex-col gap-4 text-white w-full">
              <div className="flex justify-start">
                <div className="flex flex-col sm:w-[80%] lg:w-[50%] lg:mx-[7%] xl:w-[40%] xl:mx-[10%] xl:px-12 max-w-[400px] bg-primary p-6 rounded-4xl ">
                  <p className="uppercase text-2xl font-semibold mb-3">
                    did you know?
                  </p>
                  <p className="">
                    <span className="font-semibold font-light">
                      Mosquitoes that spread dengue bite during the day,
                    </span>
                    with peak hours early in the morning and before sunset.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="flex flex-col sm:w-[80%] lg:w-[50%] lg:mx-[7%] xl:w-[40%] xl:mx-[10%] xl:px-12 bg-primary p-6 rounded-4xl ">
                  <p className="uppercase text-2xl font-semibold mb-3">
                    did you know?
                  </p>
                  <p className="">
                    <span className="font-semibold">
                      Wearing light-colored clothing
                    </span>
                    helps prevent mosquito bites, as mosquitoes are more
                    attracted to dark colors.
                  </p>
                </div>
              </div>
              <div className="flex justify-start ml-[-28px] mb-[-5px]">
                <div className="flex flex-col sm:w-[80%] lg:w-[50%]  bg-primary xl:w-[40%] xl:mx-[10%] xl:px-12 xl:mb-8 p-6 rounded-4xl ">
                  <p className="uppercase text-2xl font-semibold mb-3">
                    did you know?
                  </p>
                  <p className="">
                    <span className="font-semibold">
                      Only female Aedes mosquitoes bite humans
                    </span>
                    because they need blood to develop their eggs.
                  </p>
                </div>
              </div>
            </section>
          </figure>
          <figure className="sm:ml-[-44px] flex flex-col py-12 gap-7  ">
            <p className="sm:hidden text-left text-white leading-15 xl:leading-12 text-6xl xl:text-7xl font-semibold ">
              Explore <br />
              <span className="translate-y-40 italic font-bold text-[49px] xl:text-[60px]">
                Interests
              </span>
            </p>

            <div className="space-y-8 relative">
              <div className="absolute top-0 bottom-0 left-0 bg-white w-40 ml-[-34%] rounded-3xl sm:hidden">
                w
              </div>
              {/* Personal Prevention */}
              <div className="flex justify-between items-center">
                <div className="bg-secondary shadow-[1px_1px_7px_rgba(0,0,0,0.46)] mr-10 p-7 text-primary rounded-full">
                  <IconShieldCheck size={46} />
                </div>
                <div className="flex py-4 flex-col h-full items-start mr-4">
                  <p className="font-semibold text-3xl">Personal Prevention</p>
                  <p className="text-left text-lg">
                    Learn simple daily habits to protect yourself from dengue,
                    from using repellents to recognizing early symptoms.
                  </p>
                </div>
                <ArrowRight size={43} />
              </div>

              {/* Community Action */}
              <div className="flex justify-between items-center">
                <div className="bg-secondary shadow-[1px_1px_7px_rgba(0,0,0,0.46)] mr-10 p-7 text-primary rounded-full">
                  <IconUsersGroup size={46} />
                </div>
                <div className="flex py-4 flex-col h-full items-start mr-4">
                  <p className="font-semibold text-3xl">Community Action</p>
                  <p className="text-left text-lg">
                    Discover how collective efforts like cleanup drives and
                    education campaigns help prevent dengue outbreaks.
                  </p>
                </div>
                <ArrowRight size={43} />
              </div>

              {/* Home Remedies */}
              <div className="flex justify-between items-center">
                <div className="bg-secondary shadow-[1px_1px_7px_rgba(0,0,0,0.46)] mr-10 p-7 text-primary rounded-full">
                  <IconHomeFilled size={46} />
                </div>
                <div className="flex py-4 flex-col h-full items-start mr-4">
                  <p className="font-semibold text-3xl">Home Remedies</p>
                  <p className="text-left text-lg">
                    Explore natural and traditional practices used to ease
                    dengue symptoms and support recovery at home.
                  </p>
                </div>
                <ArrowRight size={43} />
              </div>

              {/* Climate & Dengue */}
              <div className="flex justify-between items-center">
                <div className="bg-secondary shadow-[1px_1px_7px_rgba(0,0,0,0.46)] mr-10 p-7 text-primary rounded-full">
                  <IconHaze size={46} />
                </div>
                <div className="flex py-4 flex-col h-full items-start mr-4">
                  <p className="font-semibold text-3xl">Climate & Dengue</p>
                  <p className="text-left text-lg">
                    Understand how weather patterns and climate change influence
                    mosquito breeding and dengue spread.
                  </p>
                </div>
                <ArrowRight size={43} />
              </div>

              {/* Innovation in Prevention */}
              <div className="flex justify-between items-center">
                <div className="bg-secondary shadow-[1px_1px_7px_rgba(0,0,0,0.46)] mr-10 p-7 text-primary rounded-full">
                  <IconAutomation size={46} stroke={2} />
                </div>
                <div className="flex py-4 flex-col h-full items-start mr-4">
                  <p className="font-semibold text-3xl">
                    Innovation in Prevention
                  </p>
                  <p className="text-left text-lg">
                    Learn about modern technologies and innovative methods
                    fighting dengue—from smart traps to biological control.
                  </p>
                </div>
                <ArrowRight size={43} />
              </div>
            </div>
          </figure>
        </div>
      </section>
    </main>
  );
};

export default Prevention;
