import React from "react";

const ImageGrid = ({ images = [] }) => {
  return (
    images.length > 0 && (
      <div className="grid grid-cols-2 mt-4 gap-1">
        {images.slice(0, 4).map((img, index) => (
          <div key={index} className="relative max-w-[315px] max-h-[225px]">
            <img
              src={img}
              className={`w-full aspect-[4/3] object-cover rounded-lg ${
                index === 3 && images.length > 4 ? "opacity-70" : ""
              }`}
              alt={`Image ${index + 1}`}
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                <p className="text-white text-4xl font-semibold">
                  +{images.length - 4}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  );
};

export default ImageGrid;
