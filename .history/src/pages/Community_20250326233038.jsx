import React from "react";
import FilterButton from "../components/Community/FilterButton";
import { Heading } from "../components";

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
          className="text-7xl text-center "
        />
        <p className="text-center text-lg font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <div className="bg-base-200 px-6 py-5">
          <p className="font-semibold mb-3">
            Share your experience to the Community
          </p>
          <hr />
          <div></div>
        </div>
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
