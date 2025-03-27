import React from "react";
import profile1 from "../assets/profile1.png";
import { PostCard, CustomInput, Heading, FilterButton } from "../components";

const Community = () => {
  return (
    <main className="pl-6 flex gap-x-6">
      <article className="flex-8 ">
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
          images={["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg"]}
        />
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
