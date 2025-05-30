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
      <img
        className="w-full object-cover rounded-tl-lg"
        src={sprayingAlcohol}
      />
    </main>
  );
};

export default Prevention;
