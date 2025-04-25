import { useState } from "react";
import { ArrowLeft } from "phosphor-react";
import profile1 from "../../assets/profile1.png";
import post1 from "../../assets/post1.jpg";
import post2 from "../../assets/post2.jpg";
import post3 from "../../assets/post3.jpg";
import post4 from "../../assets/post4.jpg";
import post5 from "../../assets/post5.jpg";

import {
  PostCard,
  CustomInput,
  Heading,
  FilterButton,
  AnnouncementCard,
  CustomSearchBar,
  SecondaryButton,
  DescriptionWithImages,
  NewPostModal,
} from "../../components";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useCreatePostWithImageMutation,
} from "../../api/dengueApi.js";

const Community = () => {
  const [showAside, setShowAside] = useState(false);
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reportType, setReportType] = useState("");
  const [filter, setFilter] = useState("latest"); // 'latest', 'popular', 'myPosts'

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates(`${latitude}, ${longitude}`);
      });
    }
  };
  const setNow = () => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().split(" ")[0].slice(0, 5)); // HH:MM
  };

  // Format timestamp to relative time
  const formatTimestamp = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "just now";
    }
  };

  const { data: posts, isLoading, isError, refetch } = useGetPostsQuery();
  const [createPost] = useCreatePostMutation();
  const [createPostWithImage] = useCreatePostWithImageMutation();
  console.log(posts);

  const handleCreatePost = async (postData) => {
    try {
      if (postData.images) {
        const formData = new FormData();
        Object.keys(postData).forEach((key) => {
          if (key === "images") {
            postData.images.forEach((image) => {
              formData.append("images", image);
            });
          } else {
            formData.append(key, postData[key]);
          }
        });
        await createPostWithImage(formData).unwrap();
      } else {
        await createPost(postData).unwrap();
      }
      refetch();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Error loading posts</div>;
  return (
    <main className="pl-6 text-primary text-lg flex gap-x-6 max-w-[1350px] m-auto relative mt-12">
      <article className="flex-8 shadow-xl p-12 rounded-lg w-[100vw] lg:w-[65vw]">
        <CustomSearchBar />
        <section className="flex gap-x-2 font-semibold w-full mb-8">
          <FilterButton
            text="Popular"
            active={filter === "popular"}
            onClick={() => setFilter("popular")}
          />
          <FilterButton
            text="Latest"
            active={filter === "latest"}
            onClick={() => setFilter("latest")}
          />
          <FilterButton
            text="My Posts"
            active={filter === "myPosts"}
            onClick={() => setFilter("myPosts")}
          />
        </section>
        <Heading
          text="Stay /ahead/ of dengue."
          className="text-[47px] sm:text-7xl lg:text-8xl text-center mb-4 leading-21"
        />
        <p className=" text-lg sm:text-xl sm:mt-0 text-center font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <section className="bg-base-200 px-8 py-5 rounded-lg mb-4">
          <p className="font-semibold text-lg text-center mb-3 lg:text-left">
            Share your experience with the Community
          </p>
          <hr className="text-accent mb-4" />
          <button
            onClick={() => document.getElementById("my_modal_4").showModal()}
            className="w-full hover:cursor-pointer"
          >
            <CustomInput profileSrc={profile1} showImagePicker={true} />
          </button>
        </section>
        {/* POST MODAL */}
        <NewPostModal />
        <section className="bg-base-200 px-8 py-6 rounded-lg flex flex-col gap-y-6">
          {posts?.map((post) => (
            <PostCard
              key={post._id}
              profileImage={profile1}
              username={
                post.anonymous ? "Anonymous" : post.user?.username || "User"
              }
              timestamp={formatTimestamp(post.createdAt)} // Updated this line
              location={`${post.barangay}, ${post.district}`}
              dateTime={new Date(post.date_and_time).toLocaleString()}
              reportType={post.report_type}
              description={post.description}
              likes={post.likesCount || "0"}
              comments={post.commentsCount || "0"}
              shares={post.sharesCount || "0"}
              images={post.images}
            />
          ))}
        </section>
      </article>

      <aside
        className={`bg-base-300 px-6 py-8 shadow-2xl rounded-sm overflow-y-scroll transition-transform duration-300 ease-in-out 
    fixed inset-y-0 right-0 w-[70vw] top-[68px] max-w-[70vw] pt-20 lg:pt-6 z-50 lg:z-0 lg:sticky lg:top-22 lg:h-[calc(100vh-1.5rem)] 
    lg:w-[35vw] lg:max-w-[450px] lg:shadow-sm ${
      showAside ? "translate-x-0" : "translate-x-full"
    } lg:translate-x-0`}
      >
        <AnnouncementCard />
        <button
          onClick={() => setShowAside(false)}
          className="absolute top-4 right-4 lg:hidden bg-primary text-white p-2 rounded-full hover:cursor-pointer hover:bg-white hover:text-primary transition-all duration-200"
        >
          <ArrowLeft size={18} className="rotate-180" />
        </button>
      </aside>

      {!showAside && (
        <button
          onClick={() => setShowAside(true)}
          className="fixed bottom-[40vh] right-[-1px] z-50 lg:hidden bg-primary text-white p-2 py-4 shadow-xl rounded-sm hover:cursor-pointer hover:bg-white hover:text-primary transition-all duration-200"
        >
          <ArrowLeft size={20} />
        </button>
      )}
    </main>
  );
};

export default Community;
