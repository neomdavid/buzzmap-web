import React from "react";
import FilterButton from "../components/Community/FilterButton";
import { Heading } from "../components";

const Community = () => {
  return (
    <main className="pl-10 flex gap-x-6">
      <article className="flex-8 bg-red-400">
        <section className="flex gap-x-4 font-semibold w-full bg-amber-800">
          <FilterButton text="Popular" />
          <FilterButton text="Latest" />
          <FilterButton text="My Posts" />
        </section>
        <Heading text="Stay /ahead/ of dengue." className="text-8xl" />
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
