import React from "react";
import { useNavigate } from "react-router-dom";

const NewsGrid = ({ articles }) => {
  const navigate = useNavigate();

  // Truncate text helper
  const truncateText = (text, maxLength) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  // Handle article click
  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`); // Adjust this route to match your SingleArticle route
  };

  return (
    <div className="flex flex-col gap-10 xl:grid xl:grid-cols-6 xl:items-start">
      {/* Left side - main articles */}
      <div className="grid sm:grid-cols-12 xl:col-span-4 gap-10 h-full">
        {/* First article */}
        <div
          className="w-full p-5 sm:col-span-4 gap-3 flex flex-col rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
          onClick={() => handleArticleClick(articles[0].id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && handleArticleClick(articles[0].id)
          }
        >
          <img
            className="w-full h-70 xl:h-80 object-cover rounded-xl"
            src={articles[0].image}
            alt={articles[0].title}
          />
          <p className="text-left font-semibold">{articles[0].date}</p>
          <p className="text-left font-semibold text-3xl">
            {articles[0].title}
          </p>
          <p className="text-left text-lg">{articles[0].description}</p>
        </div>

        {/* Second article - featured */}
        <div
          className="h-110 sm:h-full sm:col-span-8 rounded-xl overflow-hidden flex flex-col justify-end p-6 px-8 relative cursor-pointer hover:shadow-lg transition-shadow duration-300"
          style={{
            backgroundImage: `url(${articles[1].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={() => handleArticleClick(articles[1].id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            e.key === "Enter" && handleArticleClick(articles[1].id)
          }
        >
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
            }}
          ></div>
          <p className="z-10 text-white text-left mb-3">{articles[1].date}</p>
          <p className="z-10 mb-3 text-left text-white text-3xl font-semibold relative z-10 max-w-[80%]">
            {articles[1].title}
          </p>
          <p className="z-10 text-left text-white text-lg relative z-10 max-w-[80%]">
            {articles[1].description}
          </p>
        </div>
      </div>

      {/* Right side - smaller articles */}
      <div className="flex gap-10 xl:col-span-2 xl:flex-col">
        {articles.slice(2, 4).map((article, index) => (
          <div
            key={article.id}
            className="w-full sm:col-span-6 gap-3 flex flex-col rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleArticleClick(article.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && handleArticleClick(article.id)
            }
          >
            <img
              className="w-full h-60 object-cover rounded-xl"
              src={article.image}
              alt={article.title}
            />
            <p className="text-left font-semibold">{article.date}</p>
            <p className="text-left font-semibold text-3xl truncate max-w-full">
              {truncateText(article.title, 80)}
            </p>
            <p className="text-left text-lg truncate max-w-full">
              {truncateText(article.description, 120)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;
