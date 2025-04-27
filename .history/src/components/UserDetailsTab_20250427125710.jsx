import { DotsThree } from "phosphor-react";

const UserDetailsTab = ({ profileImage, username, timestamp }) => {
  return (
    <div className="flex justify-between items-start mb-4">
      {/* Left Side: Profile Image + User Info */}
      <div className="flex gap-x-4">
        <img
          src={profileImage}
          className="h-12 w-12 rounded-full"
          alt="Profile"
        />
        <div className="flex flex-col">
          <p className="font-bold text-md">{username}</p>
          <p className="text-[12px] text-gray-500">{timestamp}</p>
        </div>
      </div>
      {/* Right Side: Dots Icon */}
      <DotsThree size={28} />
    </div>
  );
};

export default UserDetailsTab;
