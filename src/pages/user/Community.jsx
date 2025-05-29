import { useState } from "react";
import { ArrowLeft, MagnifyingGlass, UserCircle } from "phosphor-react";
import profile1 from "../../assets/profile1.png";
import post1 from "../../assets/post1.jpg";
import post2 from "../../assets/post2.jpg";
import post3 from "../../assets/post3.jpg";
import post4 from "../../assets/post4.jpg";
import post5 from "../../assets/post5.jpg";
import { formatDistanceToNow } from "date-fns";
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
  useGetAllAdminPostsQuery,
} from "../../api/dengueApi.js";
import { useSelector } from "react-redux";
import { toastInfo } from "../../utils.jsx";
import React from "react";
import { useNavigate } from "react-router-dom";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const userFromStore = useSelector((state) => state.auth?.user);
  const [searchParams, setSearchParams] = useState({
    barangay: '',
    report_type: '',
    status: 'Validated', // Default to showing only validated posts
    username: '',
    description: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const navigate = useNavigate();

  // Fetch admin posts
  const { data: adminPosts, isLoading: isLoadingAdminPosts } = useGetAllAdminPostsQuery();

  // Find the latest announcement
  const latestAnnouncement = React.useMemo(() => {
    if (!adminPosts) return null;
    const announcements = adminPosts.filter(post => post.category === "announcement");
    if (announcements.length === 0) return null;
    // Sort by publishDate in descending order
    announcements.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    return announcements[0]; // Return the latest one
  }, [adminPosts]);

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

  // Get all posts without filtering
  const { data: posts, isLoading: isLoadingPosts } = useGetPostsQuery({
    status: "Validated",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Filter and sort posts based on the selected tab
  const filteredPosts = React.useMemo(() => {
    if (!posts) return [];
    
    // First filter for validated posts
    let filtered = posts.filter(post => post.status === "Validated");
    
    // Apply search filter if there's a search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        // Search in username
        (post.user?.username?.toLowerCase().includes(query)) ||
        // Search in barangay
        (post.barangay?.toLowerCase().includes(query)) ||
        // Search in report type
        (post.report_type?.toLowerCase().includes(query)) ||
        // Search in description
        (post.description?.toLowerCase().includes(query))
      );
    }
    
    // Then apply the selected filter
    switch (filter) {
      case "popular":
        filtered = filtered.sort((a, b) => 
          ((Array.isArray(b.upvotes) ? b.upvotes.length : 0) - (Array.isArray(b.downvotes) ? b.downvotes.length : 0)) -
          ((Array.isArray(a.upvotes) ? a.upvotes.length : 0) - (Array.isArray(a.downvotes) ? a.downvotes.length : 0))
        );
        break;
      
      case "latest":
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      
      case "myPosts":
        if (userFromStore) {
          filtered = filtered
            .filter(post => post.user?._id === userFromStore._id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        break;
      
      default:
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
    
    return filtered;
  }, [posts, filter, userFromStore, searchQuery]);

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
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  // Update the handleSearch function
  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = searchQuery.trim();
    if (searchValue) {
      console.log('Navigating to search with query:', searchValue);
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  // Add a clear search handler
  const handleClearSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      barangay: '',
      report_type: '',
      status: 'Validated',
      username: '',
      description: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setIsSearching(false);
  };

  if (isLoadingAdminPosts || isLoadingPosts) {
    return <div>Loading...</div>;
  }

  return (
    <main className="pl-6 text-primary text-lg flex gap-x-6 max-w-[1350px] m-auto relative mt-12">
      <article className="flex-8 shadow-xl p-12 rounded-lg w-[90vw] lg:w-[30vw]">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, barangay, report type, or description..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute left-3 top-2.5">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
          </div>
        </form>

        {!searchQuery && (
          <section className="flex gap-x-2 font-semibold w-full mb-8">
            <FilterButton
              text="Popular"
              active={filter === "popular"}
              onClick={() => {
                setFilter("popular");
                setSearchParams(prev => ({
                  ...prev,
                  sortBy: 'likesCount',
                  sortOrder: 'desc'
                }));
              }}
            />
            <FilterButton
              text="Latest"
              active={filter === "latest"}
              onClick={() => {
                setFilter("latest");
                setSearchParams(prev => ({
                  ...prev,
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                }));
              }}
            />
            {userFromStore && userFromStore.role === "user" && (
              <FilterButton
                text="My Posts"
                active={filter === "myPosts"}
                onClick={() => {
                  setFilter("myPosts");
                  setSearchParams(prev => ({
                    ...prev,
                    username: userFromStore.username
                  }));
                }}
              />
            )}
          </section>
        )}

        {isSearching && (
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600">
              Search results for "{searchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              className="text-primary hover:text-accent"
            >
              Clear Search
            </button>
          </div>
        )}

        <Heading
          text="Stay /ahead/ of dengue."
          className="text-[47px] sm:text-7xl lg:text-8xl text-center mb-4 leading-21"
        />
        <p className=" text-lg sm:text-xl sm:mt-0 text-center font-semibold text-primary mb-6">
          Real-Time Dengue Updates from the Community.
        </p>
        <section className="bg-base-200 px-8 py-5 rounded-lg mb-4">
          <p className="font-semibold text-lg text-center mb-3 lg:text-left">
            Report a breeding site to Quezon City Epidemiology and Surveillance
            Division.
          </p>
          <hr className="text-accent mb-4" />
          <button
            onClick={() => {
              userFromStore && userFromStore.role == "user"
                ? document.getElementById("my_modal_4").showModal()
                : toastInfo("Log in to report a breeding site.");
            }}
            className="w-full hover:cursor-pointer"
          >
            <CustomInput 
              profileSrc={profile1} 
              showImagePicker={true} 
              className="hover:cursor-pointer" 
              readOnly
            />
          </button>
        </section>
        {/* POST MODAL */}
        <NewPostModal onSubmit={handleClearSearch} />
        <section className="bg-base-200 px-8 py-6 rounded-lg flex flex-col gap-y-6">
          {isLoadingPosts ? (
            <div className="text-center">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-gray-500">
              {searchQuery
                ? "No posts found matching your search."
                : filter === "myPosts"
                  ? "You haven't made any posts yet."
                  : "No validated posts available."}
            </p>
          ) : (
            <>
              {searchQuery && (
                <p className="text-sm text-gray-500 mb-4">
                  Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                </p>
              )}
              {filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  profileImage={
                    post.isAnonymous
                      ? <UserCircle size={48} className="text-gray-400 mr-[-6px]" />
                      : profile1
                  }
                  username={
                    post.isAnonymous
                      ? post.anonymousId || "Anonymous"
                      : post.user?.username || "User"
                  }
                  timestamp={formatTimestamp(post.createdAt)}
                  barangay={post.barangay}
                  coordinates={post.specific_location?.coordinates || []}
                  dateTime={new Date(post.date_and_time).toLocaleString()}
                  reportType={post.report_type}
                  description={post.description}
                  images={post.images}
                  postId={post._id}
                  upvotes={Array.isArray(post.upvotes) ? post.upvotes.length : 0}
                  downvotes={Array.isArray(post.downvotes) ? post.downvotes.length : 0}
                  _commentCount={post._commentCount || 0}
                  upvotesArray={post.upvotes || []}
                  downvotesArray={post.downvotes || []}
                />
              ))}
            </>
          )}
        </section>
      </article>

      <aside
        className={`bg-base-300 px-6 py-8 shadow-2xl rounded-sm overflow-y-scroll transition-transform duration-300 ease-in-out 
    fixed inset-y-0 right-0 w-[90vw] top-[58px] max-w-[90vw] pt-20 lg:pt-6 z-10 lg:z-0 lg:sticky lg:top-19 lg:h-[calc(100vh-1.5rem)] 
    lg:w-[40vw] lg:max-w-[450px] lg:shadow-sm ${
      showAside ? "translate-x-0" : "translate-x-full"
    } lg:translate-x-0`}
      >
        <AnnouncementCard announcement={latestAnnouncement} />
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
