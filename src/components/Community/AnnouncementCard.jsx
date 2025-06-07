import React, { useState, useEffect } from "react";
import announcementImg from "../../assets/announcementimg.png"; // Default image
import defaultProfile from "../../assets/default_profile.png";
import profile1 from "../../assets/profile1.png";

import { DotsThree, PaperPlaneRight, ArrowLeft } from "phosphor-react";
import ImageGrid from "./ImageGrid";
import ReactionsTab from "./ReactionsTab";
import Comment2 from "./Comment2";
import { useSelector } from "react-redux";
import { 
  useGetAdminPostCommentsQuery, 
  useAddAdminPostCommentMutation,
  useUpvoteAdminPostCommentMutation,
  useDownvoteAdminPostCommentMutation,
  useRemoveAdminPostCommentUpvoteMutation,
  useRemoveAdminPostCommentDownvoteMutation,
  useGetBasicProfilesQuery
} from "../../api/dengueApi";
import { showCustomToast } from "../../utils.jsx";
import { formatDistanceToNow } from "date-fns";

const AnnouncementCard = ({ announcement }) => {
  console.log('[DEBUG] AnnouncementCard - Initial announcement:', announcement);
  
  const [comment, setComment] = useState("");
  const userFromStore = useSelector((state) => state.auth?.user);
  
  // Use the admin post comments endpoint
  const { data: comments, isLoading: isLoadingComments, refetch, error } = useGetAdminPostCommentsQuery(announcement?._id, {
    skip: !announcement?._id,
    pollingInterval: 5000,
  });

  // Fetch basic profiles
  const { data: userProfiles } = useGetBasicProfilesQuery();

  // Create a map of user profiles for quick lookup
  const userProfileMap = React.useMemo(() => {
    if (!userProfiles) return {};
    return userProfiles.reduce((acc, profile) => {
      acc[profile._id] = profile;
      return acc;
    }, {});
  }, [userProfiles]);

  const [addComment] = useAddAdminPostCommentMutation();
  const [upvoteComment] = useUpvoteAdminPostCommentMutation();
  const [downvoteComment] = useDownvoteAdminPostCommentMutation();
  const [removeCommentUpvote] = useRemoveAdminPostCommentUpvoteMutation();
  const [removeCommentDownvote] = useRemoveAdminPostCommentDownvoteMutation();

  // Debug effect for comments
  useEffect(() => {
    console.log('[DEBUG] AnnouncementCard - Fetching comments for announcement:', announcement?._id);
    console.log('[DEBUG] AnnouncementCard - Comments data:', comments);
    console.log('[DEBUG] AnnouncementCard - Is loading:', isLoadingComments);
    console.log('[DEBUG] AnnouncementCard - Error:', error);
  }, [announcement?._id, comments, isLoadingComments, error]);

  // Add local state for announcement votes
  const [localUpvotes, setLocalUpvotes] = useState(announcement?.upvotes || []);
  const [localDownvotes, setLocalDownvotes] = useState(announcement?.downvotes || []);

  // Add local state for comment votes
  const [localCommentVotes, setLocalCommentVotes] = useState({});

  // Update local state when props change
  useEffect(() => {
    setLocalUpvotes(announcement?.upvotes || []);
    setLocalDownvotes(announcement?.downvotes || []);
  }, [announcement?.upvotes, announcement?.downvotes]);

  // Update comment votes when comments change
  useEffect(() => {
    if (comments) {
      const initialCommentVotes = {};
      comments.forEach(comment => {
        initialCommentVotes[comment._id] = {
          upvotes: comment.upvotes || [],
          downvotes: comment.downvotes || []
        };
      });
      setLocalCommentVotes(initialCommentVotes);
    }
  }, [comments]);

  // Use dynamic data if available, otherwise fallback to static/default values
  const title = announcement?.title || "Important Announcement";
  // Split content by newline characters for rendering paragraphs
  const contentParts = announcement?.content?.split('\n') || [
    "🚨 DENGUE OUTBREAK IN QUEZON CITY! 🚨",
    "",
    "Quezon City is currently facing a dengue outbreak, with cases surging by 200% from January 1 to February 14. Residents are urged to take immediate precautions to prevent the spread of the disease.",
    "",
    "🔴 What You Need to Know:",
    "✅ Dengue cases have drastically increased—stay alert!",
    "Read more...",
  ];
  const images = announcement?.images && announcement.images.length > 0 ? announcement.images : [announcementImg];
  // For simplicity, reactions are kept static for now, but could also be dynamic
  const likes = announcement?.likesCount || "100k"; // Assuming likesCount might come from data
  const commentsCount = announcement?.commentsCount || "43k"; // Assuming commentsCount might come from data
  const shares = announcement?.sharesCount || "20k"; // Assuming sharesCount might come from data

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      if (diffMinutes < 1) {
        return "just now";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "just now";
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] AnnouncementCard - Submitting comment:', {
      postId: announcement._id,
      content: comment.trim(),
      user: userFromStore
    });

    if (!userFromStore) {
      showCustomToast("Please log in to comment", "error");
      return;
    }
    if (!comment.trim()) return;
    try {
      const result = await addComment({ postId: announcement._id, content: comment.trim() }).unwrap();
      console.log('[DEBUG] AnnouncementCard - Comment submission result:', result);
      setComment("");
      refetch();
    } catch (error) {
      console.error('[DEBUG] AnnouncementCard - Failed to add comment:', error);
      showCustomToast("Failed to add comment", "error");
    }
  };

  const handleVoteUpdate = (newUpvotes, newDownvotes) => {
    setLocalUpvotes(newUpvotes);
    setLocalDownvotes(newDownvotes);
  };

  const handleCommentVoteUpdate = (commentId, newUpvotes, newDownvotes) => {
    setLocalCommentVotes(prev => ({
      ...prev,
      [commentId]: {
        upvotes: newUpvotes,
        downvotes: newDownvotes
      }
    }));
  };

  const [showAside, setShowAside] = useState(true);

  return (
    <div className="flex flex-col">
      <section className="bg-primary text-white flex flex-col p-6 py-6 rounded-2xl">
        <div className="flex justify-between mb-8">
          <div className="flex gap-x-3">
            <div className="flex flex-col">
              <h1 className="text-4xl">{title}</h1>
              <p className="font-semibold text-[12px]">
                <span className="font-normal">From</span> Quezon City
                Epidemiology & Surveillance Division (CESU)
              </p>
              <p className="font-semibold text-[12px]">{formatTimestamp(announcement?.publishDate)}</p>
            </div>
          </div>
          <DotsThree size={32} />
        </div>

        <div className="mb-4">
          {contentParts.map((part, index) => (
            <p key={index} className={part.includes("Read more...") ? "italic underline font-semibold" : ""}>
              {part === "" ? <br /> : part}
            </p>
          ))}
          {images.length > 0 && (
            <div className="mt-4">
              <ImageGrid images={images} sourceType={announcement?.images ? "url" : "import"} />
            </div>
          )}
        </div>

        <div>
          <ReactionsTab
            postId={announcement?._id}
            upvotes={localUpvotes.length}
            downvotes={localDownvotes.length}
            commentsCount={comments?.length || 0}
            iconSize={21}
            textSize="text-lg"
            className={"mb-2"}
            upvotesArray={localUpvotes}
            downvotesArray={localDownvotes}
            currentUserId={userFromStore?._id}
            onCommentClick={() => {}}
            useCustomToast={true}
            onShowToast={showCustomToast}
            isAdminPost={true}
            userFromStore={userFromStore}
            onVoteUpdate={handleVoteUpdate}
          />
          <hr className="text-white opacity-35 mb-4" />
          <form onSubmit={handleCommentSubmit} className="flex">
            <img 
              src={userFromStore?.profilePhotoUrl || defaultProfile} 
              className="h-11 w-11 rounded-full mr-3 object-cover" 
              alt="profile"
            />
            <div className="flex-1 flex items-center">
              <input
                className="bg-white opacity-93 rounded-2xl placeholder-primary/70 px-4 w-full h-full text-primary focus:outline-none"
                placeholder={!userFromStore || userFromStore.role !== "user" ? "Log in to comment on this post..." : "Comment on this post..."}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!userFromStore || userFromStore.role !== "user"}
              />
              <button
                type="submit"
                disabled={!userFromStore || userFromStore.role !== "user" || !comment.trim()}
                className="ml-2 p-2 cursor-pointer text-white hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <PaperPlaneRight size={24} weight="fill" />
              </button>
            </div>
          </form>
        </div>
      </section>
          
      <section className="py-4 px-4">
        <p className="text-primary mb-4 opacity-65 font-semibold text-lg">
          Comments from the Community
        </p>
        <div>
          <div className="flex flex-col gap-4">
            {isLoadingComments ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : error ? (
              <div className="text-center py-4 text-error">
                <p>Error loading comments</p>
                <button 
                  onClick={() => refetch()}
                  className="mt-2 text-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => {
                const userProfile = userProfileMap[comment.user?._id];
                return (
                  <div key={comment._id} className="break-words self-start w-fit max-w-full">
                    <Comment2
                      username={userProfile?.username || comment.user?.username || 'Anonymous'}
                      profileImg={userProfile?.profilePhotoUrl || defaultProfile}
                      comment={comment.content}
                      timestamp={formatTimestamp(comment.createdAt)}
                      commentId={comment._id}
                      upvotesArray={localCommentVotes[comment._id]?.upvotes || comment.upvotes || []}
                      downvotesArray={localCommentVotes[comment._id]?.downvotes || comment.downvotes || []}
                      currentUserId={userFromStore?.role === "user" ? userFromStore?._id : null}
                      onShowToast={showCustomToast}
                      onVoteUpdate={(newUpvotes, newDownvotes) => 
                        handleCommentVoteUpdate(comment._id, newUpvotes, newDownvotes)
                      }
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">No comments yet</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnnouncementCard;
