import React, { useState } from "react";
import { ArrowLeft } from "phosphor-react";
import profile1 from "../assets/profile1.png";
import post1 from "../assets/post1.jpg";
import post2 from "../assets/post2.jpg";
import post3 from "../assets/post3.jpg";
import post4 from "../assets/post4.jpg";
import post5 from "../assets/post5.jpg";

import {
  PostCard,
  CustomInput,
  Heading,
  FilterButton,
  AnnouncementCard,
} from "../components";

const Community = () => {
  const [showAside, setShowAside] = useState(false);

  return (
    <main className="pl-6 flex gap-x-6 max-w-[1250px] m-auto relative">
      <article className="flex-8 shadow-xl p-12 rounded-lg w-[100vw] lg:w-[65vw]">
        <section className="flex gap-x-2 font-semibold w-full mb-8">
          <FilterButton text="Popular" />
          <FilterButton text="Latest" />
          <FilterButton text="My Posts" />
        </section>
        <Heading
          text="Stay /ahead/ of dengue."
          className="text-[47px] lg:text-8xl text-center mb-4 leading-21"
        />
        <p className="text-center text-lg font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <section className="bg-base-200 px-8 py-5 rounded-lg mb-4">
          <p className="font-semibold text-lg text-center mb-3 lg:text-left">
            Share your experience with the Community
          </p>
          <hr className="text-accent mb-4" />
          <CustomInput profileSrc={profile1} showImagePicker={true} />
        </section>
        <section className="bg-base-200 px-8 py-6 rounded-lg flex flex-col gap-y-6">
          <PostCard
            profileImage={profile1}
            username="Anonymous Crocodile"
            timestamp="1 hour ago"
            location="Barangay Bagumbayan, Taguig City"
            dateTime="February 19, 2025 – 9:45 AM"
            reportType="Breeding Site Found"
            description="Discovered stagnant water in uncovered water containers behind a residential area. Mosquito larvae were visible. Urgent clean-up needed to prevent mosquito breeding."
            likes="24k"
            comments="24k"
            shares="5k"
          />
          {/* Other PostCards ... */}
        </section>
      </article>
      {/* Aside: Always visible on large screens (lg:block), toggled on small screens */}
      <aside
        className={`bg-base-300 px-6 py-8 shadow-md rounded-sm overflow-y-scroll sticky top-23 h-screen 
          ${showAside ? "block" : "hidden"} lg:block lg:flex-5`}
      >
        <AnnouncementCard />
        {/* Button to close aside on small screens */}
        <button
          onClick={() => setShowAside(false)}
          className="absolute top-2 right-2 lg:hidden"
        >
          <ArrowLeft size={24} />
        </button>
      </aside>
      {/* Toggle Button for small screens when aside is hidden */}
      {!showAside && (
        <button
          onClick={() => setShowAside(true)}
          className="fixed bottom-10 right-10 z-50 lg:hidden"
        >
          {/* Using ArrowLeft rotated 180 degrees to point left */}
          <ArrowLeft size={24} className="rotate-180" />
        </button>
      )}
    </main>
  );
};

export default Community;
