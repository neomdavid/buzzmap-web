import React from "react";
import { Image } from "phosphor-react";

const CustomInput = ({
  placeholder = "Is there anything you'd like to share?",
  profileSrc,
  showImagePicker = false,
  readOnly = false,
}) => {
  return (
    <div className="flex items-center gap-4">
      {profileSrc && (
        <img src={profileSrc} className="h-11 w-11 rounded-full" />
      )}
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full text-md bg-white px-4 py-3 pr-15 rounded-lg border-none placeholder-gray-400 focus:outline-none"
        />
        {showImagePicker && (
          <label
            htmlFor="image-upload"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          >
            <Image size={24} className="text-gray-500 hover:text-primary" />
            <input id="image-upload" type="file" className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
};

export default CustomInput;
