import React from "react";

const ImageGrid = ({ images = [], sourceType = "server" }) => {
  if (images.length === 0) return null;

  return (
    <div
      className={`grid gap-1 mt-4 ${
        images.length === 1
          ? "grid-cols-1 h-2rem"
          : images.length === 3
          ? "grid-cols-3"
          : "grid-cols-2"
      }`}
    >
      {images.slice(0, 4).map((img, index) => {
        // If the sourceType is "server", prepend the server URL
        // Otherwise, assume it's an imported local image and use it directly

        return (
          <div key={index} className="relative">
            <img
              src={img} // Use the correct image path
              className="w-full aspect-[4/3] object-cover rounded-md"
              alt={`Image ${index + 1}`}
            />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-gray-900/50 bg-opacity-20 flex items-center justify-center rounded-md">
                <p className="text-white text-4xl font-semibold">
                  +{images.length - 4}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ImageGrid;
