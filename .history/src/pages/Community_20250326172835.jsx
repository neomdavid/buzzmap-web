import React from "react";

const Community = () => {
  return (
    <main className="pl-10 flex gap-x-6">
      <article className="flex-8 bg-red-400">
        <section className="flex gap-x-4 font-semibold w-full bg-amber-800">
          <button className="flex-1 bg-base-200 px-8 py-1 rounded-full hover:bg-primary hover:text-white hover:cursor-pointer">
            Popular
          </button>
          <button className="flex-1 bg-base-200 px-8 py-1 rounded-full">
            Latest
          </button>
          <button className="flex-1 bg-base-200 px-8 py-1 rounded-full">
            My Posts
          </button>
        </section>
      </article>
      <aside className="flex-5 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
