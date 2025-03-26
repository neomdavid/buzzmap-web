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
        <section className="bg-base-200 px-6 py-5 mx-10 rounded-lg mb-4">
          <p className="font-semibold mb-3">
            Share your experience with the Community
          </p>
          <hr className="text-accent mb-4" />
          <CustomInput profileSrc={profile1} showImagePicker={true} />
        </section>
        <section className="bg-base-200 px-8 py-4 rounded-lg">
          <div>
            <div className="flex justify-between items-center rounded-lg px-6 py-6 bg-white">
              <div className="flex gap-x-4">
                <img src={profile1} className="h-11" />
                <div className="flex flex-col">
                  <p>Anonymous Crocodile</p>
                  <p>1 hour ago</p>
                </div>
              </div>

              <DotsThree
                size={30}
                className="hover:opacity-55 transition-all duration-200 cursor-pointer"
              />
            </div>
            <div></div>
            <div></div>
          </div>
        </section>
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
