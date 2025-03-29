import davidProfile from "../../assets/members/david.png";
const MemberCard = () => {
  return (
    <div className="flex flex-col">
      <img src={davidProfile} className="w-30" />
    </div>
  );
};

export default MemberCard;
