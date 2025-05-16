import { ArrowLeft } from "phosphor-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useGetSingleAdminPostQuery } from '../../api/dengueApi';
import { PostContentDisplay } from "../../components/Admin/FormPublicPost";
import dummyUpdates from '../../data/dummyUpdates';
import { formatArticleDate } from '../../utils';

const SingleArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dummyArticle = dummyUpdates.find(u => String(u.id) === String(id));
  const { data: article, isLoading, error } = useGetSingleAdminPostQuery(id, { skip: !!dummyArticle });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("16/9");

  // Try to find a dummy article if API fails or returns nothing
  const showDummy = (!article && !isLoading) || error;
  const displayArticle = showDummy ? dummyArticle : article;

  // Function to handle next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === (displayArticle?.images?.length || 0) - 1 ? 0 : prev + 1));
  };

  // Function to handle previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? (displayArticle?.images?.length || 0) - 1 : prev - 1));
  };

  // Effect to detect image aspect ratio
  useEffect(() => {
    if (!displayArticle?.images?.length) return;

    const img = new Image();
    img.src = displayArticle.images[currentSlide];

    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.7) {
        setAspectRatio("16/9");
      } else if (ratio > 1.4) {
        setAspectRatio("3/2");
      } else if (ratio > 1.1) {
        setAspectRatio("4/3");
      } else {
        setAspectRatio("1/1");
      }
    };
  }, [currentSlide, displayArticle?.images]);

  const aspectRatioClasses = {
    "16/9": "aspect-video",
    "3/2": "aspect-[3/2]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!displayArticle) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-xl mb-4">Article not found</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Debug: Log images and currentSlide
  console.log("article.images:", displayArticle?.images);
  console.log("currentSlide:", currentSlide);

  return (
    <main className="mt-[-50px] pt-10 flex flex-col text-primary w-full overflow-x-hidden pb-20">
      <div className="flex p-6 items-center gap-3 pt-8 justify-center w-full bg-primary text-white">
        <ArrowLeft
          size={25}
          className="hover:cursor-pointer hover:bg-gray-500 p-1 rounded-full transition-all duration-300"
          onClick={() => navigate(-1)}
        />
        <p className="font-semibold text-2xl">
          {displayArticle.category === 'news' 
            ? 'Dengue Surveillance Update'
            : '#QCESDhelps'}
        </p>
      </div>

      <p className="text-4xl sm:text-6xl tracking-[.8px] uppercase w-[90%] sm:w-[80%] mx-auto text-center p-6 sm:p-12 font-[900] break-words">
        {displayArticle.category === 'news' 
          ? formatArticleDate(displayArticle.publishDate)
          : displayArticle.title}
          <span className="font-[700]"> Dengue Surveillance Update</span>
      </p>

      <p className="text-center font-bold text-md mt-[-14px] break-words">
        {displayArticle.category === 'news' 
          ? `Published on ${formatArticleDate(displayArticle.publishDate)}`
          : `Last updated on ${formatArticleDate(displayArticle.date || displayArticle.publishDate)}`}
      </p>

      {/* Carousel */}
      {displayArticle.images && displayArticle.images.length > 0 && (
        <div className="w-[90%] sm:w-[60%] mx-auto my-10 rounded-lg overflow-hidden max-w-3xl">
          <div className="relative group">
            {/* Current Slide */}
            <div className={`w-full ${aspectRatioClasses[aspectRatio]} relative`}>
              <img
                src={displayArticle.images[currentSlide]}
                alt={displayArticle.title}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 text-2xl hover:cursor-pointer hover:bg-black/80 transition-all active:bg-black duration-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                ❮
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 text-2xl hover:cursor-pointer hover:bg-black/80 transition-all active:bg-black duration-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                ❯
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {displayArticle.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                    currentSlide === index ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="w-[90%] sm:w-[80%] mx-auto">
        <div className="break-words whitespace-pre-wrap">
          {displayArticle.content ? (
            <div>{displayArticle.content}</div>
          ) : (
            <PostContentDisplay content={displayArticle.content || displayArticle.content} />
          )}
        </div>
      </div>
    </main>
  );
};

export default SingleArticle;
