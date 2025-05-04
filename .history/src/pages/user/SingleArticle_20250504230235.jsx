import { ArrowLeft } from "phosphor-react";

const SingleArticle = () => {
  const images = [
    "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
    "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
    "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
    "https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp",
  ];

  const getImageContainerHeight = (aspectRatio = "16:9") => {
    // Assuming aspectRatio is either '16:9' or '4:3' for simplicity
    if (aspectRatio === "16:9") {
      return "h-[56.25vw]"; // 16:9 aspect ratio
    }
    if (aspectRatio === "4:3") {
      return "h-[75vw]"; // 4:3 aspect ratio
    }
    return "h-[56.25vw]"; // Default to 16:9 if no aspect ratio is provided
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

      {/* Carousel Section */}
      <div className="carousel w-[80%] m-auto my-10 rounded-lg">
        {images.map((img, index) => (
          <div
            key={index}
            id={`slide${index + 1}`}
            className={`carousel-item relative w-full ${getImageContainerHeight()}`}
          >
            <img src={img} className="w-full object-cover" />
            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
              <a
                href={`#slide${index === 0 ? images.length : index}`}
                className="btn btn-circle"
              >
                ❮
              </a>
              <a
                href={`#slide${index === images.length - 1 ? 1 : index + 2}`}
                className="btn btn-circle"
              >
                ❯
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default SingleArticle;
