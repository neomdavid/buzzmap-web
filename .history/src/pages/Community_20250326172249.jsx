import React from "react";

const Community = () => {
  return (
    <main className="pl-10 flex">
      <article>
        <section className="flex  gap-x-4 font-bold">
          <button className="bg-base-200">Popular</button>
          <button>Latest</button>
          <button>My Posts</button>
        </section>
      </article>
      <aside></aside>
    </main>
  );
};

export default Community;
