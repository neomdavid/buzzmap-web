import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetPostsQuery, useGetBarangaysQuery } from '../../api/dengueApi';
import { PostCard, CustomSearchBar, Navbar } from '../../components';
import { formatDistanceToNow } from 'date-fns';
import profile1 from '../../assets/profile1.png';
import defaultProfile from '../../assets/default_profile.png';
import { Browser, MagnifyingGlass, User } from "phosphor-react";
import { NewspaperClipping } from "phosphor-react";
import { Users } from "phosphor-react";
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
    username: '',
    filterType: '' // 'posts' or 'people' or ''
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const observer = useRef();

  // Get posts with search parameters and pagination
  // Note: Temporarily removing server-side search to rely on client-side filtering
  const { data: rawData, isLoading, isError } = useGetPostsQuery({
    // search: searchQuery, // Commented out to test client-side search
    ...filters,
    status: 'Validated',
    page,
    limit: 10
  });

  // Transform data to handle different response structures and apply client-side search as fallback
  const data = useMemo(() => {
    console.log('[DEBUG] Raw API data:', rawData);
    
    // Handle different response structures
    let posts = [];
    if (Array.isArray(rawData)) {
      posts = rawData;
    } else if (rawData?.posts) {
      posts = rawData.posts;
    } else if (rawData?.data) {
      posts = rawData.data;
    }

    // Apply client-side search as fallback if server-side search didn't work
    if (searchQuery && posts.length > 0) {
      const query = searchQuery.toLowerCase();
      const serverFilteredCount = posts.length;
      
      // Apply client-side filtering based on filter type
      let clientFiltered = [];
      
      if (filters.filterType === 'posts') {
        // Only show posts where search matches post content (not username)
        clientFiltered = posts.filter(post => 
          (post.barangay?.toLowerCase().includes(query)) ||
          (post.report_type?.toLowerCase().includes(query)) ||
          (post.description?.toLowerCase().includes(query))
        );
      } else if (filters.filterType === 'people') {
        // Only show posts where search matches username
        clientFiltered = posts.filter(post => 
          (post.user?.username?.toLowerCase().includes(query))
        );
      } else {
        // Show all matches (default behavior)
        clientFiltered = posts.filter(post => 
          (post.user?.username?.toLowerCase().includes(query)) ||
          (post.barangay?.toLowerCase().includes(query)) ||
          (post.report_type?.toLowerCase().includes(query)) ||
          (post.description?.toLowerCase().includes(query))
        );
      }
      
      console.log('[DEBUG] Server returned:', serverFilteredCount, 'posts, client filtering found:', clientFiltered.length, 'with filter type:', filters.filterType);
      
      return {
        posts: clientFiltered,
        pagination: rawData?.pagination || { totalItems: clientFiltered.length }
      };
    }

    return {
      posts: posts,
      pagination: rawData?.pagination || { totalItems: posts.length }
    };
  }, [rawData, searchQuery]);

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

  // Fetch barangays
  const { data: barangays, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  // Update filters when search params change
  useEffect(() => {
    setFilters({
      barangay: searchParams.get('barangay') || '',
      report_type: searchParams.get('report_type') || '',
      description: searchParams.get('description') || '',
      username: searchParams.get('username') || '',
      filterType: searchParams.get('filterType') || ''
    });
    // Reset page when filters change
    setPage(1);
  }, [searchParams]);

  // Compute if "All" is active (all filters are empty)
  const isAllActive =
    !filters.barangay &&
    !filters.report_type &&
    !filters.description &&
    !filters.username &&
    !filters.filterType;

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1); // Reset page when filter changes

    // Update URL with new filters
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset page when search changes
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', query);
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
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-22 bottom-0 w-[300px] bg-base-200/40 text-primary py-10 px-8">
          <p className="text-3xl font-semibold mb-4">Search Results for <br /> <span className='font-extrabold capitalize'>"{searchQuery}"</span></p>
          <hr className='mt-8 mb-8 border-accent' />
          <div className='flex flex-col font-semibold text-lg gap-1'>
            <p className='mb-2 text-[18px]'> Filters</p>
            <div 
              className={`flex gap-2.5 items-center text-primary hover:text-white hover:bg-primary/60 hover:cursor-pointer transition-all duration-300 rounded-xl px-4 py-2 ${
                isAllActive ? 'bg-primary text-white' : ''
              }`}
                                  onClick={() => {
                      setFilters({
                        barangay: '',
                        report_type: '',
                        description: '',
                        username: '',
                        filterType: ''
                      });
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('barangay');
                      newParams.delete('report_type');
                      newParams.delete('description');
                      newParams.delete('username');
                      newParams.delete('filterType');
                      setSearchParams(newParams);
                    }}
            >
              <div><IconMenuDeep stroke={3} /> </div>
              <p>All</p>
            </div>
            <div 
              className={`flex gap-2.5 items-center text-primary hover:text-white hover:bg-primary/60 hover:cursor-pointer transition-all duration-300 rounded-xl px-4 py-2 ${
                filters.filterType === 'posts' ? 'bg-primary text-white' : ''
              }`}
              onClick={() => handleFilterChange('filterType', filters.filterType === 'posts' ? '' : 'posts')}
            >
              <div><IconTableShare stroke={2} size={23} weight='fill' /> </div>
              <p>Posts</p>
            </div>
            <div 
              className={`flex gap-2.5 items-center text-primary hover:text-white hover:bg-primary/60 hover:cursor-pointer transition-all duration-300 rounded-xl px-4 py-2 mb-3 ${
                filters.filterType === 'people' ? 'bg-primary text-white' : ''
              }`}
              onClick={() => handleFilterChange('filterType', filters.filterType === 'people' ? '' : 'people')}
            >
              <div><Users stroke={2} size={23} weight='fill' /> </div>
              <p>People</p>
            </div>

            <select 
              className='select w-full text-lg select-primary bg-inherit rounded-lg mb-2 hover:cursor-pointer'
              value={filters.barangay}
              onChange={(e) => handleFilterChange('barangay', e.target.value)}
            >
              <option value="">All Barangays</option>
              {!isLoadingBarangays && barangays?.map((barangay) => (
                <option key={barangay._id} value={barangay.name}>
                  {barangay.name}
                </option>
              ))}
            </select>
            <select 
              className='select w-full text-lg select-primary bg-inherit rounded-lg hover:cursor-pointer'
              value={filters.report_type}
              onChange={(e) => handleFilterChange('report_type', e.target.value)}
            >
              <option value="">All Report Types</option>
              <option value="Stagnant Water">Stagnant Water</option>
              <option value="Uncollected Garbage or Trash">Uncollected Garbage or Trash</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <CustomSearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                placeholder="Search for posts, people, or locations..."
                className="w-full max-w-2xl mx-auto"
              />
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
              <p className="text-2xl font-semibold mb-4 text-primary">Search Results for <span className='font-extrabold capitalize'>"{searchQuery}"</span></p>
              <div className='flex flex-col font-semibold text-lg gap-2 bg-base-200/40 p-4 rounded-lg'>
                <p className='text-[18px] text-primary'>Filters</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    className={`flex gap-2 items-center px-4 py-2 rounded-xl whitespace-nowrap ${
                      isAllActive ? 'bg-primary text-white' : 'text-primary hover:bg-primary/60 hover:text-white'
                    }`}
                    onClick={() => {
                      setFilters({
                        barangay: '',
                        report_type: '',
                        description: '',
                        username: '',
                        filterType: ''
                      });
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('barangay');
                      newParams.delete('report_type');
                      newParams.delete('description');
                      newParams.delete('username');
                      newParams.delete('filterType');
                      setSearchParams(newParams);
                    }}
                  >
                    <IconMenuDeep stroke={3} />
                    <span>All</span>
                  </button>
                  <button
                    className={`flex gap-2 items-center px-4 py-2 rounded-xl whitespace-nowrap ${
                      filters.filterType === 'posts' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/60 hover:text-white'
                    }`}
                    onClick={() => handleFilterChange('filterType', filters.filterType === 'posts' ? '' : 'posts')}
                  >
                    <IconTableShare stroke={2} size={23} weight='fill' />
                    <span>Posts</span>
                  </button>
                  <button
                    className={`flex gap-2 items-center px-4 py-2 rounded-xl whitespace-nowrap ${
                      filters.filterType === 'people' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/60 hover:text-white'
                    }`}
                    onClick={() => handleFilterChange('filterType', filters.filterType === 'people' ? '' : 'people')}
                  >
                    <Users stroke={2} size={23} weight='fill' />
                    <span>People</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className='select w-full text-lg select-primary bg-inherit rounded-lg hover:cursor-pointer text-primary'
                    value={filters.barangay}
                    onChange={(e) => handleFilterChange('barangay', e.target.value)}
                  >
                    <option value="" className="text-primary">All Barangays</option>
                    {!isLoadingBarangays && barangays?.map((barangay) => (
                      <option key={barangay._id} value={barangay.name} className="text-primary">
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                  <select 
                    className='select w-full text-lg select-primary bg-inherit rounded-lg hover:cursor-pointer text-primary'
                    value={filters.report_type}
                    onChange={(e) => handleFilterChange('report_type', e.target.value)}
                  >
                    <option value="" className="text-primary">All Report Types</option>
                    <option value="Stagnant Water" className="text-primary">Stagnant Water</option>
                    <option value="Uncollected Garbage or Trash" className="text-primary">Uncollected Garbage or Trash</option>
                    <option value="Others" className="text-primary">Others</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading && page === 1 ? (
              <div className="text-center">Loading posts...</div>
            ) : isError ? (
              <div className="text-center text-error">Error loading posts</div>
            ) : data?.posts?.length === 0 ? (
              <p className="text-lg text-primary font-semibold">
                No posts found matching your search criteria.
              </p>
            ) : (
              <>
                <p className="text-2xl text-primary font-semibold mb-4">
                  Found {data?.pagination?.totalItems || 0} result{data?.pagination?.totalItems !== 1 ? 's' : ''}
                </p>
                <div className="space-y-6">
                  {data?.posts?.map((post, index) => (
                    <div 
                      key={post._id} 
                      className='shadow-sm'
                      ref={index === data.posts.length - 1 ? lastPostElementRef : null}
                    >
                      <PostCard
                        profileImage={post.isAnonymous ? defaultProfile : (post.user?.profilePhotoUrl && post.user.profilePhotoUrl.trim() !== "" ? post.user.profilePhotoUrl : defaultProfile)}
                        username={post.isAnonymous ? post.anonymousId : post.user?.username || "User"}
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
                      />
                    </div>
                  ))}
                </div>
                {isLoading && page > 1 && (
                  <div className="text-center py-4">Loading more posts...</div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchResults; 