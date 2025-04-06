import { Heading } from "../components";
import sprayingAlcohol from "../assets/sprayingalcohol.jpg";

const Prevention = () => {
  return (
    <main className="flex flex-col text-center items-center justify-center mt-2 py-8">
      <div className="mx-4">
        <Heading text="Stay one step /ahead/" className="text-8xl mb-4" />
        <p className="font-semibold text-xl">
          Read and View Smart Tips to Prevent Dengue and Protect Your Community
          Below
        </p>
      </div>

      <div className="relative w-[112%] rounded-tl-[450px] rounded-tr-[450px] mt-8 overflow-hidden">
        {/* Image */}
        <img className="w-full h-150 object-cover" src={sprayingAlcohol} />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/2 to-transparent"></div>
      </div>
      <section className="px-6 py-8 w-full px-2 bg-primary flex flex-col text-white items-start">
        <p className="font-bold italic">Trending Articles</p>
      </section>
    </main>
  );
};

export default Prevention;
