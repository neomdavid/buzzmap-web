import React from "react";
import FilterButton from "../components/Community/FilterButton";
import { Heading } from "../components";
import profile1 from "../assets/profile1.png";
import { DotsThree, Image } from "phosphor-react";
import CustomInput from "../components/Community/CustomInput";

const Community = () => {
  return (
    <main className="pl-6 flex gap-x-6">
      <article className="flex-8 ">
        <section className="flex gap-x-4 font-semibold w-full  mb-6">
          <FilterButton text="Popular" />
          <FilterButton text="Latest" />
          <FilterButton text="My Posts" />
        </section>
        <Heading
          text="Stay /ahead/ of dengue."
          className="text-7xl text-center"
        />
        <p className="text-center text-lg font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <section className="bg-base-200 px-8 py-5 mx-14 rounded-lg mb-4">
          <p className="font-semibold text-lg mb-3">
            Share your experience with the Community
          </p>
          <hr className="text-accent mb-4" />
          <CustomInput profileSrc={profile1} showImagePicker={true} />
        </section>
        <section className="bg-base-200 px-8 py-6 rounded-lg">
          <div className=" shadow-sm bg-white rounded-lg px-6 py-6 ">
            <div className="flex justify-between items-center mb-4 ">
              <div className="flex gap-x-4">
                <img src={profile1} className="h-11" />
                <div className="flex flex-col">
                  <p className="font-bold">Anonymous Crocodile</p>
                  <p className="text-sm">1 hour ago</p>
                </div>
              </div>
              <DotsThree
                size={30}
                className="hover:opacity-55 transition-all duration-200 cursor-pointer"
              />
            </div>
            <div className="text-primary">
              <p>
                <span className="font-bold">📍 Location:</span> Barangay
                Bagumbayan, Taguig City
              </p>
              <p>
                <span className="font-bold">🕑 Date & Time:</span> February 19,
                2025 – 9:45 AM
              </p>
              <p>
                <span className="font-bold">⚠️ Report Type:</span> Breeding Site
                Found
              </p>
              <p>
                📝 Description: <br />{" "}
                <span>
                  Discovered stagnant water in uncovered water containers behind
                  a residential area. Mosquito larvae were visible. Urgent
                  clean-up needed to prevent mosquito breeding.
                </span>
              </p>
            </div>
            <div></div>
          </div>
        </section>
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
