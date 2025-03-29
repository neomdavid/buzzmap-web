import davidProfile from "../../assets/members/david.png";
const MemberCard = () => {
  return (
    <div className="flex flex-col">
      <img src={davidProfile} className="w-35 rounded-full bg-white" />
      <p className="font-bold">Neo David</p>
      <p>Programmer</p>
    </div>
  );
};

export default MemberCard;
