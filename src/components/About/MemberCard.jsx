import davidProfile from "../../assets/members/david.png";
const MemberCard = ({ imgProfile, name, role, rotate, translateY }) => {
  return (
    <div className={`flex items-center p-2 flex-col text-white ${translateY}`}>
      <img
        src={imgProfile}
        className={`w-[100%] max-w-[150px] min-w-[100px] rounded-full bg-white mb-4 -rotate-10 ${rotate}`}
      />
      <p className="font-bold text-center">{name}</p>
      <p className="text-center">{role}</p>
    </div>
  );
};

export default MemberCard;
