import React from "react";

const MobileProfileHeader = ({
  profileData,
  fallbackPhoto,
  onEditBio,
  onOpenDetails,
}) => {
  return (
    <div className="lg:hidden  flex justify-center relative z-10 mb-2">
      <div className="flex flex-col items-center bg-white backdrop-blur-sm rounded-3xl p-6 shadow">
        <img
          src={profileData?.account?.profilePhotoUrl || fallbackPhoto}
          alt="profile"
          className="rounded-full w-28 h-28 object-cover border-4 border-primary shadow"
        />
        <div className="mt-3 text-center">
          <div className="font-extrabold text-2xl leading-tight">
            {profileData?.account?.username}
          </div>
          <div className="text-xs text-gray-600 mt-1 truncate max-w-[70vw] mx-auto">
            {profileData?.account?.email}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn btn-outline btn-sm" onClick={onEditBio}>
            Edit bio
          </button>
          <button className="btn btn-primary btn-sm" onClick={onOpenDetails}>
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProfileHeader;
