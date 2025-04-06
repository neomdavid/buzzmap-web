import { Heading } from "../components";
import sprayingAlcohol from "../assets/sprayingalcohol.jpg";
const Prevention = () => {
  return (
    <main className=" flex flex-col items-center justify-center mt-2 py-8 ">
      <Heading text="Stay one step /ahead/" className="text-8xl mb-4" />
      <p className="font-semibold text-xl ">
        Read and View Smart Tips to Prevent Dengue and Protect Your Community
        Below
      </p>
      <div className="w-full rounded-tr-full rounded-t-lg">
        <img className="w-full " src={sprayingAlcohol} />
      </div>
    </main>
  );
};

export default Prevention;
