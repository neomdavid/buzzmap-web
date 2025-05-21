import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetPostsQuery, useGetBarangaysQuery } from '../../api/dengueApi';
import { PostCard, CustomSearchBar, Navbar } from '../../components';
import { formatDistanceToNow } from 'date-fns';
import profile1 from '../../assets/profile1.png';
import { Browser, MagnifyingGlass, User } from "phosphor-react";
import { NewspaperClipping } from "phosphor-react"; // Only need this for "All"

// Add icons for the sidebar (you can use any icon library)
import { Users } from "phosphor-react"; // Example icons
import { IconMenuDeep, IconTableShare } from '@tabler/icons-react';

const FILTER_TYPES = [
  { key: "all", label: "All", icon: <NewspaperClipping size={20} /> },
  // You can add more types here if needed
  // { key: "posts", label: "Posts", icon: <NewspaperClipping size={20} /> },
  // { key: "people", label: "People", icon: <Users size={20} /> },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    barangay: '',
    report_type: '',
    description: '',
    username: ''
  });

  // Get search query from URL
  const searchQuery = searchParams.get('q') || '';

  // Fetch barangays
  const { data: barangays, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  // Update filters when search params change
  useEffect(() => {
    setFilters({
      barangay: searchParams.get('barangay') || '',
      report_type: searchParams.get('report_type') || '',
      description: searchParams.get('description') || '',
      username: searchParams.get('username') || ''
    });
  }, [searchParams]);

  // Get posts with search parameters
  const { data: posts, isLoading, isError } = useGetPostsQuery({
    search: searchQuery,
    ...filters,
    status: 'Validated'
  });

  // Compute if "All" is active (all filters are empty)
  const isAllActive =
    !filters.barangay &&
    !filters.report_type &&
    !filters.description &&
    !filters.username;

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL with new filters
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Log the current search parameters
  useEffect(() => {
    console.log('Current Search Parameters:', {
      searchQuery,
      filters,
      status: 'Validated'
    });
  }, [searchQuery, filters]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen mt-21.5">
        {/* Sidebar */}
        <aside className="w-120 fixed top-22 bottom-0 bg-base-200/40 text-primary py-10 px-8" >
          <p className="text-3xl font-semibold mb-4">Search Results for <br /> <span className='font-extrabold capitalize'>"{searchQuery}"</span></p>
          <hr className='mt-8 mb-8 border-accent' />
          <div className='flex flex-col font-semibold text-lg gap-1'>
            <p className='mb-2 text-[18px]'> Filters</p>
            <div className='flex gap-2.5 items-center text-primary hover:text-white hover:bg-primary/60 hover:cursor-pointer transition-all duration-300 rounded-xl px-4 py-2 '>
              <div><IconMenuDeep stroke={3} /> </div>
              <p>All</p>
            </div>
            <div className='flex gap-2.5 items-center text-primary hover:text-white hover:bg-primary/60 hover:cursor-pointer transition-all duration-300 rounded-xl px-4 py-2 '>
              <div><IconTableShare stroke={2} size={23} weight='fill' /> </div>
              <p>Posts</p>
            </div>
            <div className='flex gap-2.5 items-center text-primary hover:text-white hover:bg-primary/60 hover:cursor-pointer transition-all duration-300 rounded-xl px-4 py-2 mb-3 '>
              <div><Users stroke={2} size={23} weight='fill' /> </div>
              <p>People</p>
            </div>

            <select className='select w-full text-lg select-primary bg-inherit rounded-lg mb-2 hover:cursor-pointer'>
              <option value="All">All</option>
            </select>
            <select className='select w-full text-lg select-primary bg-inherit rounded-lg hover:cursor-pointer'>
              <option value="All">Report Type</option>
            </select>

          </div>
          {/* Filter Type Tabs */}
          <div className="mb-6">
            <div className="flex flex-col gap-2">
              <button
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                  ${isAllActive
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-primary/10"
                  }`}
                // Reset all filters when "All" is clicked
                onClick={() => {
                  setFilters({
                    barangay: '',
                    report_type: '',
                    description: '',
                    username: ''
                  });
                  // Also update the URL params
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('barangay');
                  newParams.delete('report_type');
                  newParams.delete('description');
                  newParams.delete('username');
                  setSearchParams(newParams);
                }}
              >
                <span className="bg-gray-200 rounded-full p-2 flex items-center justify-center">
                  <NewspaperClipping size={20} />
                </span>
                <span className="font-semibold">All</span>
              </button>
            </div>
          </div>

          {/* Detailed Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Barangay</label>
              <select
                value={filters.barangay}
                onChange={(e) => handleFilterChange('barangay', e.target.value)}
                className="w-full p-2 rounded border"
              >
                <option value="">Any</option>
                <option value="All Barangays">All Barangays</option>
                {!isLoadingBarangays && barangays?.map((barangay) => (
                  <option key={barangay._id} value={barangay.name}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                value={filters.report_type}
                onChange={(e) => handleFilterChange('report_type', e.target.value)}
                className="w-full p-2 rounded border"
              >
                <option value="">All</option>
                <option value="Breeding Site">Breeding Site</option>
                <option value="Dengue Case">Dengue Case</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={filters.description}
                onChange={(e) => handleFilterChange('description', e.target.value)}
                className="w-full p-2 rounded border"
                placeholder="Filter by description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">People</label>
              <input
                type="text"
                value={filters.username}
                onChange={(e) => handleFilterChange('username', e.target.value)}
                className="w-full p-2 rounded border"
                placeholder="Filter by username"
              />
            </div>
          </div>
        </aside>
        <div className='w-120'>

        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center">Loading posts...</div>
            ) : isError ? (
              <div className="text-center text-error">Error loading posts</div>
            ) : posts?.length === 0 ? (
              <p className="text-lg text-primary font-semibold">
                No posts found matching your search criteria.
              </p>
            ) : (
              <>
                <p className="text-2xl text-primary font-semibold mb-4">
                  Found {posts.length} result{posts.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-6">
                  {posts.map((post) => {
                    return <div className='shadow-sm'>
                      <PostCard
                        key={post._id}
                        profileImage={profile1}
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
                      />
                    </div>
                  })}
                </div>
              </>
            )}
          </div>

        </main>
      </div>
    </>
  );
};

export default SearchResults; 