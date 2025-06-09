import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
  const [page, setPage] = useState(1);
  const userFromStore = useSelector((state) => state.auth?.user);
  const [searchParams, setSearchParams] = useState({
    barangay: '',
    report_type: '',
    status: 'Validated',
    username: '',
    description: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const navigate = useNavigate();

  // Fetch admin posts
  const { data: adminPosts, isLoading: isLoadingAdminPosts } = useGetAllAdminPostsQuery();

  // Add debug logging
  useEffect(() => {
    console.log('[DEBUG] Admin Posts:', adminPosts);
    console.log('[DEBUG] Is Loading Admin Posts:', isLoadingAdminPosts);
  }, [adminPosts, isLoadingAdminPosts]);

  // Get posts with pagination
  const { data, isLoading, isError } = useGetPostsQuery({
    status: 'Validated',
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
    ...searchParams
  });

  // Add debug logging for the API response
  useEffect(() => {
    console.log('[DEBUG] API Response:', data);
    console.log('[DEBUG] Is Loading:', isLoading);
    console.log('[DEBUG] Is Error:', isError);
  }, [data, isLoading, isError]);

  // Intersection Observer for infinite scroll
  const observer = useRef();
  
  // Memoize the intersection observer callback
  const lastPostElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && data?.pagination?.hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, data?.pagination?.hasMore]);

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    console.log('[DEBUG] Raw data:', data);
    if (!data) return [];
    
    let filtered = Array.isArray(data) ? data : [];
    
    // Apply search filter if there's a search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        (post.user?.username?.toLowerCase().includes(query)) ||
        (post.barangay?.toLowerCase().includes(query)) ||
        (post.report_type?.toLowerCase().includes(query)) ||
        (post.description?.toLowerCase().includes(query))
      );
    }
    
    console.log('[DEBUG] Filtered posts:', filtered);
    return filtered;
  }, [data, searchQuery]);

  // Memoize the latest admin post
  const latestAnnouncement = useMemo(() => {
    console.log('[DEBUG] Getting latest admin post from:', adminPosts);
    if (!adminPosts) {
      console.log('[DEBUG] No admin posts available');
      return null;
    }
    // Filter for active posts only
    const activePosts = Array.isArray(adminPosts) ? adminPosts.filter(post => post.status === "active") : [];
    console.log('[DEBUG] Active posts:', activePosts);
    if (activePosts.length === 0) {
      console.log('[DEBUG] No active posts found');
      return null;
    }
    // Sort by publishDate to get the latest scheduled post
    activePosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    console.log('[DEBUG] Latest admin post:', activePosts[0]);
    return activePosts[0];
  }, [adminPosts]);

  // Memoize the post card render function
  const renderPostCard = useCallback((post, index) => (
    <div 
      key={post._id}
      ref={index === filteredPosts.length - 1 ? lastPostElementRef : null}
    >
      <PostCard
        profileImage={post.user?.profilePhotoUrl || 'https://i.ibb.co/0VvffYVH/a1c820a6453b.png'}
        username={post.anonymous ? "Anonymous" : post.user?.username || "User"}
        timestamp={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        barangay={post.barangay}
        coordinates={post.specific_location?.coordinates || []}
        dateTime={new Date(post.date_and_time).toLocaleString()}
        reportType={post.report_type}
        description={post.description}
        likes={post.likesCount || "0"}
        comments={post.commentsCount || "0"}
        shares={post.sharesCount || "0"}
        images={post.images}
        postId={post._id}
        upvotes={post.upvotes}
        downvotes={post.downvotes}
        commentsCount={post.commentsCount}
        upvotesArray={post.upvotes}
        downvotesArray={post.downvotes}
        _commentCount={post.commentsCount}
        userId={post.user?._id}
        currentUserId={userFromStore?._id}
        onVoteUpdate={(newUpvotes, newDownvotes) => {
          console.log('[DEBUG] Community onVoteUpdate called for post:', post._id, { newUpvotes, newDownvotes });
          // For Community page, we rely on RTK Query cache updates
          // The mutations in dengueApi.js already handle cache updates automatically
        }}
      />
    </div>
  ), [lastPostElementRef, userFromStore]);

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

  const [createPost] = useCreatePostMutation();
  const [createPostWithImage] = useCreatePostWithImageMutation();

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

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = searchQuery.trim();
    if (searchValue) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleClearSearch = (e) => {
    if (e) {
      e.preventDefault();
    }
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

  if (isLoadingAdminPosts || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="pl-6 pt-14 text-primary text-lg flex gap-x-6 max-w-[1350px] m-auto relative mt-12">
      <article className="flex-8 shadow-xl p-12 rounded-lg w-[90vw] max-w-500 lg:w-[30vw]">
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
        <p className="text-lg sm:text-xl sm:mt-0 text-center font-semibold text-primary mb-6">
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
              profileSrc={userFromStore?.profilePhotoUrl || 'https://i.ibb.co/0VvffYVH/a1c820a6453b.png'} 
              showImagePicker={true} 
              className="hover:cursor-pointer" 
              readOnly
            />
          </button>
        </section>
        <NewPostModal onSubmit={handleClearSearch} />
        <section className="bg-base-200 px-8 py-6 rounded-lg flex flex-col gap-y-6">
          {isLoading && page === 1 ? (
            <div className="text-center">Loading posts...</div>
          ) : isError ? (
            <div className="text-center text-error">Error loading posts</div>
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
                  Found {data?.pagination?.totalItems || 0} result{data?.pagination?.totalItems !== 1 ? 's' : ''}
                </p>
              )}
              {filteredPosts.map((post, index) => renderPostCard(post, index))}
              {isLoading && page > 1 && (
                <div className="text-center py-4">Loading more posts...</div>
              )}
            </>
          )}
        </section>
      </article>

      <aside
        className={`bg-base-300 shadow-2xl rounded-sm overflow-y-scroll transition-transform duration-300 ease-in-out 
        fixed inset-y-0 right-0 w-[80vw] top-[58px] sm:top-[65px] pb-4 max-w-170 z-10 lg:z-0 lg:sticky lg:top-19 lg:h-[calc(100vh-1.5rem)] 
        lg:w-[40vw] lg:max-w-[450px] lg:shadow-sm ${
          showAside ? "translate-x-0" : "translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="sticky top-0 bg-base-300  px-6 py-4 flex justify-between items-center z-100 border-b border-gray-300 pt-6 pb-4">
          <p className="text-3xl font-bold text-primary">Official Announcement</p>
          <button
            onClick={() => setShowAside(false)}
            className="lg:hidden bg-primary text-white p-2 rounded-full hover:cursor-pointer hover:bg-white hover:text-primary transition-all duration-200"
          >
            <ArrowLeft size={18} className="rotate-180" />
          </button>
        </div>
        <div className="px-6 py-8">
          {latestAnnouncement && (
            <AnnouncementCard 
              announcement={latestAnnouncement} 
              key={latestAnnouncement._id}
            />
          )}
        </div>
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
