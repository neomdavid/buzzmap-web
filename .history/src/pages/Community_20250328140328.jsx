import React from "react";
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
import { MagnifyingGlass } from "phosphor-react";

const Community = () => {
  return (
    <main className="pl-0 lg:pl-6 flex gap-x-6 max-w-[1250px] m-auto relative">
      <article className="flex-8  shadow-xl p-12 rounded-lg">
        <div className="relative w-full flex items-center rounded-sm">
          {/* Search Icon */}
          <MagnifyingGlass
            size={16}
            stroke={4}
            className="absolute left-7 top-7 -translate-y-1/2 text-primary"
          />

          {/* Input Field */}
          <input
            className="bg-base-200 p-6 pl-14 py-7 w-full h-12 mb-6 rounded-3xl focus:outline-primary/20"
            placeholder="Search for latest reports..."
          />
        </div>

        <section className="flex gap-x-2 font-semibold w-full  mb-8">
          <FilterButton text="Popular" />
          <FilterButton text="Latest" />
          <FilterButton text="My Posts" />
        </section>
        <Heading
          text="Stay /ahead/ of dengue."
          className="text-6xl sm:text-7xl xl:text-8xl leading-20 text-center mb-0 lg:mb-2 xl:mb-3 "
        />
        <p className="text-center text-lg font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <section className="bg-base-200 px-8 py-5  rounded-lg mb-4">
          <p className="font-semibold text-lg text-center mb-3 lg:text-left">
            Share your experience with the Community
          </p>

          <hr className="text-accent mb-4" />
          <CustomInput profileSrc={profile1} showImagePicker={true} />
        </section>
        <section className="bg-base-200  px-8 py-6 rounded-lg flex flex-col gap-y-6">
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

          <PostCard
            profileImage={profile1}
            username="Anonymous Hippo"
            timestamp="2 days ago"
            location="Pasay City Market Area"
            dateTime="February 17, 2025 – 3:20 PM"
            reportType="Suspected Dengue Case"
            description="Vendor reported experiencing high fever and body aches. Advised to seek medical attention. The market area has multiple potential breeding spots"
            likes="24k"
            comments="24k"
            shares="5k"
            images={[post1, post2, post3, post4, post5]}
          />
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
        </section>
      </article>
      <aside className="hidden lg:block lg:flex-5 bg-base-300 px-6 py-8 shadow-md rounded-sm sticky top-23 h-screen overflow-y-scroll py-4">
        <AnnouncementCard />
      </aside>
    </main>
  );
};

export default Community;
