import { ArrowLeft } from "phosphor-react";
import { useState, useEffect } from "react";

const SingleArticle = () => {
  // Example images array - replace with your actual images
  const images = [
    {
      url: "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
      alt: "Mosquito breeding place 1",
    },
    {
      url: "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
      alt: "Mosquito breeding place 2",
    },
    {
      url: "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
      alt: "Mosquito breeding place 3",
    },
    {
      url: "https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp",
      alt: "Mosquito breeding place 4",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("16/9"); // Default aspect ratio

  // Function to handle next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Function to handle previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Effect to detect image aspect ratio
  useEffect(() => {
    const img = new Image();
    img.src = images[currentSlide].url;

    img.onload = () => {
      const ratio = img.width / img.height;
      // Set common aspect ratio classes based on the image's actual ratio
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
  }, [currentSlide, images]);

  // Aspect ratio classes mapping
  const aspectRatioClasses = {
    "16/9": "aspect-video", // Tailwind's 16:9
    "3/2": "aspect-[3/2]", // Custom 3:2
    "4/3": "aspect-[4/3]", // Custom 4:3
    "1/1": "aspect-square", // Square
  };

  return (
    <main className="mt-[-4px] flex flex-col text-primary">
      <div className="flex p-6 items-center gap-3 justify-center w-full bg-primary text-white">
        <ArrowLeft
          size={25}
          className="hover:cursor-pointer hover:bg-gray-500 p-1 rounded-full transition-all duration-300"
        />
        <p className="font-semibold text-2xl">Prevention/Tips</p>
      </div>

      <p className="text-6xl text-center p-12 font-bold">
        Identifying and Eliminating Mosquito Breeding Places
      </p>

      <p className="text-center font-bold text-md mt-[-14px]">
        Last updated on May 23rd, 2024 at 03:44 PM
      </p>

      {/* Carousel */}
      <div className="w-[80%] mx-auto my-10 rounded-lg overflow-hidden">
        <div className="relative group">
          {/* Current Slide */}
          <div className={`w-full ${aspectRatioClasses[aspectRatio]} relative`}>
            <img
              src={images[currentSlide].url}
              alt={images[currentSlide].alt}
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
            {images.map((_, index) => (
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
    </main>
  );
};

export default SingleArticle;
