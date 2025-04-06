import { Heading } from "../components";
import sprayingAlcohol from "../assets/sprayingalcohol.jpg";
const Prevention = () => {
  return (
    <main className="flex flex-col text-center items-center justify-center mt-2 py-8 ">
      <div className="mx-4">
        <Heading
          text="Stay one step /ahead/"
          className="text-8xl mb-4 leading-12"
        />
        <p className="font-semibold text-xl ">
          Read and View Smart Tips to Prevent Dengue and Protect Your Community
          Below
        </p>
      </div>

      <div className="w-[112%]  rounded-tl-[450px] rounded-tr-[450px] overflow-hidden">
        <img className="w-full h-150  object-cover " src={sprayingAlcohol} />
      </div>
    </main>
  );
};

export default Prevention;
