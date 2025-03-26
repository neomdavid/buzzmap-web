import React from "react";

const Community = () => {
  return (
    <main className="pl-10 flex">
      <article className="flex-6.5 bg-red-400">
        <section className="flex  gap-x-4 font-semibold ">
          <button className="bg-base-200 px-8 py-1 rounded-full">
            Popular
          </button>
          <button>Latest</button>
          <button>My Posts</button>
        </section>
      </article>
      <aside className="flex-7 bg-amber-200">hello</aside>
    </main>
  );
};

export default Community;
