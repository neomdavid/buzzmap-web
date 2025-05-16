import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import patientImg from "../../assets/dengue-patient-1.jpg";

const NewsGrid = ({ articles = [] }) => {
  const navigate = useNavigate();

  // Add logging at the start of the component
  console.log('NewsGrid component rendered');
  console.log('Articles received:', articles);

  useEffect(() => {
    console.log('NewsGrid useEffect triggered');
    console.log('Articles in useEffect:', articles);
  }, [articles]);

  if (!Array.isArray(articles) || articles.length === 0) {
    console.log('Articles is not an array or empty:', articles);
    return <p>No articles available</p>;
  }

  // Truncate text helper
  const truncateText = (text, maxLength) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  // Handle article click
  const handleArticleClick = (articleId) => {
    navigate(`/buzzline/${articleId}`);
  };

  // Get the first two articles for the main section
  const [firstArticle, secondArticle] = articles;
  // Get the remaining articles for the right side
  const remainingArticles = articles.slice(2, 4);

  return (
    <div className="flex flex-col gap-10 xl:grid xl:grid-cols-6 xl:items-start">
      {/* Left side - main articles */}
      <div className="grid sm:grid-cols-12 xl:col-span-4 gap-10 h-full">
        {/* First article */}
        {firstArticle && (
          <div
            className="w-full sm:col-span-4 gap-3 flex flex-col rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleArticleClick(firstArticle._id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && handleArticleClick(firstArticle._id)
            }
          >
            <img
              className="w-full h-70 xl:h-80 object-cover rounded-xl"
              src={firstArticle.images?.[0]?.replace('h/', '')}
              alt={firstArticle.title}
            />
            <div className="flex flex-col gap-3 p-3">
              <p className="text-left font-semibold">{firstArticle.date}</p>
              <p className="text-left font-semibold text-3xl">
                {firstArticle.title}
              </p>
              <p className="text-left text-lg">{firstArticle.description}</p>
            </div>
          </div>
        )}

        {/* Second article - featured */}
        {secondArticle && (
          <div
            className="h-110 sm:h-full sm:col-span-8 rounded-xl overflow-hidden flex flex-col justify-end p-6 px-8 relative cursor-pointer hover:shadow-lg transition-shadow duration-300"
            style={{
              backgroundImage: `url(${secondArticle.images?.[0]?.replace('h/', '')})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => handleArticleClick(secondArticle._id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" && handleArticleClick(secondArticle._id)
            }
          >
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
              }}
            ></div>
            <p className="z-10 text-white text-left mb-3">{secondArticle.date}</p>
            <p className="z-10 mb-3 text-left text-white text-3xl font-semibold relative z-10 max-w-[80%]">
              {secondArticle.title}
            </p>
            <p className="z-10 text-left text-white text-lg relative z-10 max-w-[80%]">
              {secondArticle.description}
            </p>
          </div>
        )}
      </div>

      {/* Right side - smaller articles */}
      <div className="flex gap-10 xl:col-span-2 xl:flex-col">
        {remainingArticles.map((article, index) => {
          console.log('Processing article:', article);
          
          if (!article) {
            console.log('Null article at index:', index);
            return null;
          }
          
          const imageUrl = article.images?.[0]?.replace('h/', '') || patientImg;
          
          return (
            <div
              key={index}
              className="w-full sm:col-span-6 gap-3 flex flex-col rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handleArticleClick(article._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && handleArticleClick(article._id)
              }
            >
              <img
                className="w-full h-60 object-cover rounded-xl"
                src={imageUrl}
                alt={article.title}
                onError={(e) => {
                  console.log('Image failed to load:', imageUrl);
                  e.target.src = patientImg;
                }}
              />
              <div className="flex flex-col gap-3 p-3">
                <p className="text-left font-semibold">{article.date}</p>
                <p className="text-left font-semibold text-3xl truncate max-w-full">
                  {truncateText(article.title, 80)}
                </p>
                <p className="text-left text-lg truncate max-w-full">
                  {truncateText(article.description, 120)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsGrid;

