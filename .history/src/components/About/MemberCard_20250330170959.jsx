import davidProfile from "../../assets/members/david.png";
const MemberCard = ({ imgProfile, name, role, rotate, translateY }) => {
  return (
    <div
      className={`flex z-2 items-center p-2 flex-col text-white md:${translateY}`}
    >
      <img
        src={imgProfile}
        className={`w-[100%] xl:w-[160px] max-w-[150px] min-w-[100px] rounded-full bg-white mb-4 md:-rotate-10 md:${rotate}`}
      />
      <p className="font-bold text-center">{name}</p>
      <p className="text-center">{role}</p>
    </div>
  );
};

export default MemberCard;
