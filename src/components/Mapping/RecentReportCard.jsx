import { ArrowRight } from "phosphor-react";
import UserDetailsTab from "../UserDetailsTab";

const RecentReportCard = ({
  profileImage,
  username,
  timestamp,
  date,
  time,
  reportType,
  description,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 w-[300px] flex-shrink-0">
      <UserDetailsTab
        profileImage={profileImage}
        username={username}
        timestamp={timestamp}
      />
      <div className="flex flex-col relative gap-y-1 text-[11.5px] h-[90px] overflow-hidden text-ellipsis pr-4">
        <p className="truncate">
          <span className="font-semibold">🕒 Date: </span>
          {date}
        </p>
        <p className="truncate">
          <span className="font-semibold">🕒 Time: </span>
          {time}
        </p>
        <p className="truncate">
          <span className="font-semibold">⚠️ Report Type: </span>
          {reportType}
        </p>
        <p className="overflow-hidden text-ellipsis line-clamp-3 mr-3">
          <span className="font-semibold">📝 Description: </span>
          {description}
        </p>
        <div className="absolute right-0.5 bg-primary text-white bottom-0 p-1 rounded-full hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer">
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
};

export default RecentReportCard;
