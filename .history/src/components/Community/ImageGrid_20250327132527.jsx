import React from "react";

const ImageGrid = ({ images = [] }) => {
  if (images.length === 0) return null;

  return (
    <div
      className={`grid gap-1 mt-4 ${
        images.length === 1
          ? "grid-cols-1"
          : images.length === 3
          ? "grid-cols-3"
          : "grid-cols-2"
      }`}
    >
      {images.slice(0, 4).map((img, index) => (
        <div key={index} className="relative">
          <img
            src={img}
            className="w-full aspect-[4/3] object-cover rounded-lg"
            alt={`Image ${index + 1}`}
          />
          {index === 3 && images.length > 4 && (
            <div className="absolute inset-0  opacity-30 bg-opacity-90 flex items-center justify-center rounded-lg">
              <p className="text-white text-4xl font-semibold">
                +{images.length - 4}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
