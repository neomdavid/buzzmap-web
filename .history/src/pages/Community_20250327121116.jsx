import React from "react";
import profile1 from "../assets/profile1.png";
import post1 from "../assets/post1.jpg";
import post2 from "../assets/post2.jpg";
import post3 from "../assets/post3.jpg";
import post4 from "../assets/post4.jpg";
import post5 from "../assets/post5.jpg";

import { PostCard, CustomInput, Heading, FilterButton } from "../components";

const Community = () => {
  return (
    <main className="pl-6 flex gap-x-6 max-w-[1250px] m-auto xl:bg-red-100 ">
      <article className="flex-7s">
        <section className="flex gap-x-2 font-semibold w-full  mb-6">
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
        <PostCard
          profileImage="profile1.jpg"
          username="Anonymous Crocodile"
          timestamp="1 hour ago"
          location="Barangay Bagumbayan, Taguig City"
          dateTime="February 19, 2025 – 9:45 AM"
          reportType="Breeding Site Found"
          description="Discovered stagnant water in uncovered water containers behind a residential area. Mosquito larvae were visible. Urgent clean-up needed to prevent mosquito breeding."
          likes="24k"
          comments="24k"
          shares="5k"
          images={[post1, post2, post3, post4, post5]}
        />
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
