import { ArrowLeft } from "phosphor-react";
const SingleArticle = () => {
  return (
    <main className="mt-[-4px] flex flex-col ">
      <div className="flex p-3 items-center gap-6 justify-center w-full bg-primary text-white">
        <ArrowLeft
          size={20}
          className="hover:cursor-pointer  hover:bg-gray-500 p-2 rounded-full transition-all duration-300   "
        />
        <p className="  font-semibold text-2xl">Prevention/Tips</p>
      </div>
    </main>
  );
};

export default SingleArticle;
