import { ArrowLeft } from "phosphor-react";
const SingleArticle = () => {
  return (
    <main className="mt-[-4px] flex flex-col ">
      <div className="flex p-6 items-center gap-3 justify-center w-full bg-primary text-white">
        <ArrowLeft
          size={25}
          className="hover:cursor-pointer  hover:bg-gray-500 p-1 rounded-full transition-all duration-300   "
        />
        <p className="  font-semibold text-2xl">Prevention/Tips</p>
      </div>
      <p className="text-6xl text-center p-12 text-primary font-bold">
        {" "}
        Identifying and Eliminating Mosquito Breeding Places
      </p>
    </main>
  );
};

export default SingleArticle;
