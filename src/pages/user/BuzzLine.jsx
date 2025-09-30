import { Heading } from "../../components";
import {
  IconShieldCheck,
  IconMapPin,
  IconBuildingBank,
  IconBan,
  IconCircleCheck,
} from "@tabler/icons-react";
import { ArrowRight } from "phosphor-react";
import { useGetAllAdminPostsQuery } from "../../api/dengueApi";
import womanLowHand from "../../assets/woman_lowhand.png";
import { useNavigate } from "react-router-dom";
import BuzzLineFooter from "../../components/BuzzLineFooter";
import UpdatesCard from "../../components/UpdatesCard";
import ArticlesCard from "../../components/ArticlesCard";

const BuzzLine = () => {
  // Fetch admin posts
  const { data: adminPosts, isLoading } = useGetAllAdminPostsQuery();
  const navigate = useNavigate();

  // Filter for news and tips (exclude archived posts)
  const newsArticles =
    adminPosts?.filter(
      (post) => post.category === "news" && post.status !== "archived"
    ) || [];
  const tipArticles =
    adminPosts?.filter(
      (post) => post.category === "tip" && post.status !== "archived"
    ) || [];

  return (
    <main className="flex flex-col text-center items-center justify-center mt-2 py-8 overflow-x-hidden py-20">
      <div className="mx-4 mb-16">
        <Heading
          text="Stay one step /ahead/"
          className="text-8xl md:text-9xl mb-4"
        />
        <p className="font-semibold text-xl mx-4">
          Read and View Smart Tips to Prevent Dengue and Protect Your Community
          Below
        </p>
      </div>

      <section className="px-6 rounded-t-4xl sm:px-14 py-20 pt-24 w-full bg-primary flex flex-col text-white items-start z-10 gap-14 md:gap-23">
        <p className="font-bold italic text-4xl sm:text-5xl w-full text-center ">
          Latest Dengue Surveillance Updates
        </p>
        {/* THIS IS FOR DATA WITH CATEGORY OF NEWS SO USE UPDATECARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 w-full gap-12">
          {isLoading ? (
            [...Array(8)].map((_, idx) => (
              <div key={idx} className="card bg-gray-200 shadow-xl">
                <div className="w-full h-60 rounded-t-xl bg-gray-300 skeleton" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 w-24 bg-gray-300 skeleton rounded" />
                  <div className="h-6 w-3/4 bg-gray-300 skeleton rounded" />
                  <div className="h-4 w-full bg-gray-300 skeleton rounded" />
                  <div className="h-4 w-5/6 bg-gray-300 skeleton rounded" />
                  <div className="h-9 w-28 bg-gray-300 skeleton rounded mt-2" />
                </div>
              </div>
            ))
          ) : newsArticles.length > 0 ? (
            newsArticles
              .slice(0, 8)
              .map((post) => (
                <UpdatesCard
                  key={post._id}
                  image={
                    post.images && post.images.length > 0
                      ? post.images[0]
                      : undefined
                  }
                  date={
                    post.publishDate
                      ? new Date(post.publishDate).toLocaleDateString()
                      : ""
                  }
                  title={post.title}
                  summary={post.content}
                  onReadMore={() => navigate(`/buzzline/${post._id}`)}
                />
              ))
          ) : (
            <div className="col-span-full text-center py-10 mb-40">
              <p className="text-white text-xl">
                No updates available at the moment.
              </p>
              <p className="text-white/80 text-sm mt-2">
                Check back later for the latest dengue surveillance updates.
              </p>
            </div>
          )}
        </div>
        {newsArticles.length > 0 && (
          <p
            className="text-lg underline text-white text-center w-full flex items-center justify-center gap-4 cursor-pointer"
            onClick={() => navigate("/buzzline/updates")}
          >
            View All Latest Dengue Surveillance Updates
            <ArrowRight size={18} />
          </p>
        )}
      </section>
      <section className="text-primary flex flex-col font-normal gap-14 md:gap-23 w-full px-6 sm:px-14 py-20 ">
        <p className="text-primary text-4xl sm:text-5xl font-bold italic">
          #QCESDhelps
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 text-white">
          {/* THIS IS FOR DATA WITH CATEGORY OF TIP SO CREATE A CARD FOR IT  */}
          {isLoading ? (
            [...Array(8)].map((_, idx) => (
              <div key={idx} className="card bg-gray-200 shadow-xl">
                <div className="w-full h-60 rounded-t-xl bg-gray-300 skeleton" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 w-24 bg-gray-300 skeleton rounded" />
                  <div className="h-6 w-3/4 bg-gray-300 skeleton rounded" />
                  <div className="h-4 w-full bg-gray-300 skeleton rounded" />
                  <div className="h-4 w-5/6 bg-gray-300 skeleton rounded" />
                  <div className="h-9 w-28 bg-gray-300 skeleton rounded mt-2" />
                </div>
              </div>
            ))
          ) : tipArticles.length > 0 ? (
            tipArticles
              .slice(0, 8)
              .map((post) => (
                <ArticlesCard
                  key={post._id}
                  image={
                    post.images && post.images.length > 0
                      ? post.images[0]
                      : undefined
                  }
                  date={
                    post.publishDate
                      ? new Date(post.publishDate).toLocaleDateString()
                      : ""
                  }
                  title={post.title}
                  summary={post.content}
                  onReadMore={() => navigate(`/buzzline/${post._id}`)}
                />
              ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-primary text-xl">
                No tips available at the moment.
              </p>
              <p className="text-primary/80 text-sm mt-2">
                Check back later for helpful dengue prevention tips.
              </p>
            </div>
          )}
        </div>
        {tipArticles.length > 0 && (
          <p
            className="text-lg underline text-primary font-bold text-center w-full flex items-center justify-center gap-4 cursor-pointer"
            onClick={() => navigate("/buzzline/articles")}
          >
            View All #QCESDhelps Articles
            <ArrowRight size={18} />
          </p>
        )}
      </section>
      <div className="flex flex-col w-full px-10 md:flex-row  md:pr-0 relative pt-20 pb-40 xl:pt-35 xl:pb-50">
        <section className="flex flex-col text-primary gap-6 flex-1 xl:items-center text-left xl:text-center">
          <h1 className="text-7xl xl:text-8xl  leading-16 k">
            Why staying updated is{" "}
          </h1>
          <h1 className=" mt-[-22px] text-accent text-8xl xl:text-9xl xl:mt-[-18px] ">
            important.
          </h1>
          <div className=" text-lg md:w-[60vw] z-10">
            <p>
              Dengue is unpredictable—and outbreaks can escalate quickly. That's
              why staying updated through the{" "}
              <span className="font-bold">BuzzLine</span> is more than just
              reading articles—it's about{" "}
              <span className="font-bold">staying aware</span>,{" "}
              <span className="font-bold">prepared</span>, and{" "}
              <span className="font-bold">involved</span>
            </p>
            <br />
            <p>Each post offers valuable insights that can help you:</p>
          </div>
          <div className="flex flex-wrap xl:justify-center gap-3 mt-[-2px] md:w-[80vw] z-10 ">
            <div className="flex items-center gap-2 font-bold text-primary py-2 px-6 rounded-2xl bg-gradient-to-b from-[#FADD37] to-[#F8A900]">
              <IconMapPin size={22} className="text-primary" />
              <p>Identify areas at risk</p>
            </div>
            <div className="flex items-center gap-2 font-bold text-primary py-2 px-6 rounded-2xl bg-gradient-to-b from-[#FADD37] to-[#F8A900]">
              <IconBuildingBank size={22} className="text-primary" />
              <p>Understand government efforts</p>
            </div>
            <div className="flex items-center gap-2 font-bold text-primary py-2 px-6 rounded-2xl bg-gradient-to-b from-[#FADD37] to-[#F8A900]">
              <IconBan size={22} className="text-primary" />
              <p>Apply preventive measures</p>
            </div>
            <div className="flex items-center gap-2 font-bold text-primary py-2 px-6 rounded-2xl bg-gradient-to-b from-[#FADD37] to-[#F8A900]">
              <IconCircleCheck size={22} className="text-primary" />
              <p>Share verified, timely information</p>
            </div>
            <div className="flex items-center gap-2 font-bold text-primary py-2 px-6 rounded-2xl bg-gradient-to-b from-[#FADD37] to-[#F8A900]">
              <IconShieldCheck size={22} className="text-primary" />
              <p>Act early to protect yourself and those around you</p>
            </div>
          </div>
        </section>
        <img
          src={womanLowHand}
          className=" hidden md:block absolute right-0  w-150 lg:w-180 xl:hidden top-0 lg:top-[-50px]"
          alt="illustration"
        />
      </div>
      <BuzzLineFooter />
    </main>
  );
};

export default BuzzLine;
