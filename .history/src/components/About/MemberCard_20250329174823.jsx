import davidProfile from "../../assets/members/david.png";
const MemberCard = ({ imgProfile, name, role, rotate, translateY }) => {
  return (
    <div className={`flex items-center p-2 flex-col text-white ${translateY}`}>
      <img
        src={imgProfile}
        className={`w-[80%] min-w-[100px] rounded-full bg-white mb-4 -rotate-10 ${rotate}`}
      />
      <p className="font-bold">{name}</p>
      <p>{role}</p>
    </div>
  );
};

export default MemberCard;
