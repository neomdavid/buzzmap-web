import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuzzLineFooter from "../../components/BuzzLineFooter";
import ArticlesCard from "../../components/ArticlesCard";
import { useGetAllAdminPostsQuery } from "../../api/dengueApi";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Articles = () => {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const { data: adminPosts, isLoading } = useGetAllAdminPostsQuery();
  const articles =
    adminPosts?.filter(
      (post) => post.category === "tip" && post.status !== "archived"
    ) || [];

  const carouselArticles = useMemo(() => {
    const sorted = [...articles].sort((a, b) => {
      const da = new Date(a.publishDate || 0).getTime();
      const db = new Date(b.publishDate || 0).getTime();
      return db - da;
    });
    return sorted.slice(0, 5);
  }, [articles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (carouselArticles.length || 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselArticles.length]);

  useEffect(() => {
    const el = document.getElementById(`item${current + 1}`);
    const container = carouselRef.current;
    if (el && container) {
      try {
        container.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
      } catch (_) {
        // Fallback without smooth
        container.scrollLeft = el.offsetLeft;
      }
    }
  }, [current]);

  const handleReadMore = (article) => {
    navigate(`/buzzline/${article._id}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-10">
      <div className="flex-1 flex flex-col items-center justify-center w-full mb-16">
        {isLoading ? (
          <div
            ref={carouselRef}
            className="carousel w-full h-[500px] overflow-hidden whitespace-nowrap"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="carousel-item inline-block w-full h-full relative"
              >
                <div className="w-full h-full rounded-xl bg-base-200 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="carousel w-full h-[500px] overflow-x-auto whitespace-nowrap"
          >
            {carouselArticles.map((article, idx) => (
              <div
                key={article._id}
                id={`item${idx + 1}`}
                className="carousel-item inline-block w-full h-full relative"
              >
                <img
                  src={
                    article.images && article.images.length > 0
                      ? article.images[0]
                      : undefined
                  }
                  className="w-full h-full object-cover rounded-xl"
                  alt={`slide ${idx + 1}`}
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-10 px-13 rounded-b-xl">
                  <p className="text-white text-3xl font-extrabold drop-shadow-lg mb-2">
                    #QCESDhelps - Published on
                  </p>
                  <p className="text-white text-6xl font-extrabold uppercase mb-4 drop-shadow-lg">
                    {article.publishDate ? formatDate(article.publishDate) : ""}
                  </p>
                  <p
                    className="text-white text-lg drop-shadow-lg"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {article.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex w-full justify-center gap-2 py-2 mt-5 mb-10">
          {carouselArticles.map((_, idx) => (
            <button
              key={idx}
              className={`btn btn-md ${current === idx ? "btn-primary" : ""}`}
              onClick={() => setCurrent(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 text-white">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="card bg-base-200 shadow-xl">
                <div className="w-full h-60 rounded-t-xl bg-base-300 skeleton" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 w-24 bg-base-300 skeleton rounded" />
                  <div className="h-6 w-3/4 bg-base-300 skeleton rounded" />
                  <div className="h-4 w-full bg-base-300 skeleton rounded" />
                  <div className="h-4 w-5/6 bg-base-300 skeleton rounded" />
                  <div className="h-9 w-28 bg-base-300 skeleton rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 text-white">
            {articles.map((article) => (
              <ArticlesCard
                key={article._id}
                image={
                  article.images && article.images.length > 0
                    ? article.images[0]
                    : undefined
                }
                date={
                  article.publishDate ? formatDate(article.publishDate) : ""
                }
                title={article.title}
                summary={article.content}
                onReadMore={() => handleReadMore(article)}
              />
            ))}
          </div>
        )}
      </div>
      <BuzzLineFooter />
    </main>
  );
};

export default Articles;
