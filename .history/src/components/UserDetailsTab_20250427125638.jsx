import { DotsThree } from "phosphor-react";

const UserDetailsTab = ({ profileImage, username, timestamp }) => {
  return (
    <div className="flex justify-between items-start mb-4">
      {/* Left Side: Profile Image + User Info */}
      <div className="flex gap-x-4">
        <img
          src={profileImage}
          className="h-11 w-11 rounded-full"
          alt="Profile"
        />
        <div className="flex flex-col">
          <p className="font-bold">{username}</p>
          <p className="text-md text-gray-500">{timestamp}</p>
        </div>
      </div>
      {/* Right Side: Dots Icon */}
      <DotsThree size={28} />
    </div>
  );
};

export default UserDetailsTab;
