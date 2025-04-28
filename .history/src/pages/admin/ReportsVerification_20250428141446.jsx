import {
  ImageGrid,
  ReportStatistics,
  ReportTable,
  ReportTable2,
} from "../../components";
import { useGetPostsQuery } from "../../api/dengueApi.js";
import { useState, useEffect } from "react";
import post1 from "../../assets/post1.jpg";
import post2 from "../../assets/post2.jpg";

const ReportsVerification = () => {
  const { data: posts, isLoading, isError, refetch } = useGetPostsQuery();
  const [validatedPosts, setValidatedPosts] = useState([]);
  console.log(posts);
  useEffect(() => {
    // Filter posts when the data is fetched
    if (posts) {
      setValidatedPosts(posts.filter((post) => post.status === "Validated"));
    }
  }, [posts]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading posts</p>;

  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[48%] ">
        Reports Verification
      </p>
      <div className="flex flex-col">
        <section className="flex flex-col gap-2">
          <p className="text-base-content text-4xl font-bold mb-2">
            Recent Dengue Reports
          </p>
          <div className="h-[75vh]">
            {/* Pass all posts to ReportTable2 but only display validated posts */}
            <ReportTable2 posts={posts} />
          </div>
        </section>

        {/* Selected Report Section */}
        {/* <section className="flex flex-col lg:flex-row mt-8 gap-6">
          <div className="flex flex-3 flex-col text-center items-center p-7 py-4 border-2 border-primary rounded-2xl">
            <p className="text-base-content font-semibold text-lg">
              Selected Report
            </p>
            <p className="capitalize font-extrabold text-3xl mb-4">
              Barangay Holy Spirit
            </p>
            <div className="flex flex-col gap-1 w-full text-left">
              <p className="text-black ">
                <span className="font-bold">Report ID: </span>RTP-00124
              </p>
              <p className="text-black">
                <span className="font-bold">Specific Location: </span>BLK 12,
                San Augustin Street, Holy Spirit, Quezon City
              </p>
              <p className="text-black">
                <span className="font-bold">Reported on: </span>March 2, 2025
              </p>
              <p className="text-black">
                <span className="font-bold">Description: </span>"Multiple dengue
                cases reported in Blk 12. Residents noticed a surge in mosquito
                activity near a stagnant water area. Urgent fogging needed."
              </p>
              <div className="text-black flex flex-col">
                <p className="font-bold mb-[-7px]">Photo Evidence: </p>
                <ImageGrid images={[post1, post2]} />
              </div>
            </div>
          </div>

          Report Statistics Section
          <div className="flex-7 text-base-content">
            <p className="text-4xl font-bold mb-2">Report Statistics</p>
            <p className="font-semibold">
              Dengue Reports by Barangay in Quezon City
            </p>
            <ReportStatistics
              data={[
                {
                  barangay: "Holy Spirit",
                  Verified: 1,
                  Pending: 4,
                  Rejected: 2,
                },
                { barangay: "Payatas", Verified: 3, Pending: 3, Rejected: 3 },
                {
                  barangay: "Batasan Hills",
                  Verified: 4,
                  Pending: 5,
                  Rejected: 4,
                },
                {
                  barangay: "Commonwealth",
                  Verified: 2,
                  Pending: 6,
                  Rejected: 4,
                },
                { barangay: "Fairview", Verified: 1, Pending: 1, Rejected: 3 },
              ]}
            />
          </div>
        </section> */}
      </div>
    </main>
  );
};

export default ReportsVerification;
