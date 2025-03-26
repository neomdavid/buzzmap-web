import React from "react";
import FilterButton from "../components/Community/FilterButton";
import { Heading } from "../components";
import profile1 from "../assets/profile1.png";
import { Image } from "lucide-react"; // Icon for image picker (optional)

const Community = () => {
  return (
    <main className="pl-10 flex gap-x-6">
      <article className="flex-8 bg-red-400">
        <section className="flex gap-x-4 font-semibold w-full bg-amber-800 mb-6">
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
        <div className="bg-base-200 px-6 py-5 mx-10 rounded-lg">
          <p className="font-semibold mb-3">
            Share your experience with the Community
          </p>
          <hr className="text-accent mb-3" />
          <div className="flex items-center gap-3">
            <img src={profile1} className="h-12 w-12 rounded-full" />
            <input
              type="text"
              placeholder="Is there something you'd like to share?"
              className="flex-1 bg-base-100 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Image className="w-7 h-7 text-gray-500 hover:text-primary" />
              <input id="image-upload" type="file" className="hidden" />
            </label>
          </div>
        </div>
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
