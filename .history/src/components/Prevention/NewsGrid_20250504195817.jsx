import React from "react";

const NewsGrid = ({ articles }) => {
  // Helper function to truncate text
  const truncateText = (text, maxLength) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  return (
    <div className="flex flex-col gap-10 xl:grid xl:grid-cols-6 xl:items-start">
      {/* Main featured articles (left side) */}
      <div className="grid sm:grid-cols-12 xl:col-span-4 gap-10">
        {/* First featured article */}
        <div className="w-full sm:col-span-4 gap-3 flex flex-col rounded-xl overflow-hidden">
          <img
            className="w-full h-60 xl:h-80 object-cover rounded-xl"
            src={articles[0].image}
            alt={articles[0].title}
          />
          <p className="text-left font-semibold">{articles[0].date}</p>
          <p className="text-left font-semibold text-3xl">
            {truncateText(articles[0].title, 100)}
          </p>
          <p className="text-left text-lg">
            {truncateText(articles[0].description, 200)}
            <span className="text-primary ml-2 font-semibold">
              Read More...
            </span>
          </p>
        </div>

        {/* Second featured article (hero) */}
        <div
          className="h-110 sm:h-full sm:col-span-8 rounded-xl overflow-hidden flex flex-col justify-end p-6 px-8 relative min-h-[400px]"
          style={{
            backgroundImage: `url(${articles[1].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
            }}
          ></div>
          <div className="relative z-10">
            <p className="text-white mb-3">{articles[1].date}</p>
            <p className="text-white text-3xl font-semibold mb-3 max-w-[80%]">
              {truncateText(articles[1].title, 80)}
            </p>
            <p className="text-white text-lg max-w-[80%]">
              {truncateText(articles[1].description, 120)}
              <span className="text-accent ml-2 font-semibold">
                Read More...
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Side articles (right column) */}
      <div className="flex gap-10 xl:col-span-2 xl:flex-col">
        {articles.slice(2, 4).map((article, index) => (
          <div
            key={index}
            className="w-full sm:col-span-6 gap-3 flex flex-col rounded-xl overflow-hidden"
          >
            <img
              className="w-full h-60 object-cover rounded-xl"
              src={article.image}
              alt={article.title}
            />
            <p className="text-left font-semibold">{article.date}</p>
            <p className="text-left font-semibold text-3xl">
              {truncateText(article.title, 80)}
            </p>
            <p className="text-left text-lg">
              {truncateText(article.description, 120)}
              <span className="text-primary ml-2 font-semibold">
                Read More...
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;
