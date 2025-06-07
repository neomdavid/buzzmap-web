import React from "react";
import { Image } from "phosphor-react";
import defaultProfile from "../../assets/default_profile.png";
import { useSelector } from "react-redux";

const CustomInput = ({
  placeholder = "Spotted potential dengue breeding sites? Report them here",
  profileSrc,
  showImagePicker = false,
  readOnly = false,
}) => {
  const userFromStore = useSelector((state) => state.auth?.user);

  return (
    <div className="flex items-center gap-4">
      <img 
        src={userFromStore ? profileSrc : defaultProfile} 
        className="h-11 w-11 rounded-full object-cover" 
        alt="profile"
      />
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
