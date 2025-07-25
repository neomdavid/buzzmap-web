import React, { useState, useEffect, useRef } from "react";
import ReactionsTab from "./ReactionsTab";
import ImageGrid from "./ImageGrid";
import { UserDetailsTab } from "../";
import { useSelector } from "react-redux";
import CommentModal from "./CommentModal";
import { toastInfo } from "../../utils.jsx";
import { useGetCommentsQuery } from "../../api/dengueApi";
import defaultProfile from "../../assets/default_profile.png";

const PostCard = ({
  profileImage,
  username,
  timestamp,
  barangay, // Pass the barangay here
  coordinates, // Pass the coordinates here
  dateTime,
  reportType,
  description,
  likes,
  comments,
  shares,
  images = [],
  postId,
  upvotes,
  downvotes,
  commentsCount,
  upvotesArray = [],
  downvotesArray = [],
  _commentCount = 0, // Add this prop with default value
  userId, // Add userId prop
  currentUserId, // Add currentUserId prop
  onVoteUpdate, // Add onVoteUpdate prop
  basicProfiles = [], // Add basicProfiles prop
}) => {
  // Debug logging for PostCard props
  console.log('[DEBUG] PostCard received props:', {
    postId,
    upvotesArray,
    downvotesArray,
    currentUserId,
    hasOnVoteUpdate: !!onVoteUpdate,
    userId
  });

  const userFromStore = useSelector((state) => state.auth?.user);
  const commentModalRef = useRef(null);
  
  // Get user profile from basicProfiles if available, otherwise use props
  const getUserProfile = () => {
    if (basicProfiles.length > 0 && userId) {
      const profile = basicProfiles.find(p => p._id === userId);
      if (!profile) {
        // If no profile found, check if profileImage is empty and use default
        const fallbackImage = profileImage && profileImage.trim() !== "" ? profileImage : defaultProfile;
        return { username, profilePhotoUrl: fallbackImage };
      }
      // If profilePhotoUrl is empty string or null/undefined, use default
      const profilePhotoUrl = profile.profilePhotoUrl && profile.profilePhotoUrl.trim() !== "" 
        ? profile.profilePhotoUrl 
        : defaultProfile;
      return { ...profile, profilePhotoUrl };
    }
    // Check if profileImage is empty and use default
    const fallbackImage = profileImage && profileImage.trim() !== "" ? profileImage : defaultProfile;
    return { username, profilePhotoUrl: fallbackImage };
  };
  
  const userProfile = getUserProfile();
  
  // Fetch actual comments to get real count
  const { data: actualComments } = useGetCommentsQuery(postId, {
    skip: !postId,
  });
  
  // Initialize local state with props
  const [localUpvotes, setLocalUpvotes] = useState(upvotesArray);
  const [localDownvotes, setLocalDownvotes] = useState(downvotesArray);
  
  // Calculate actual comment count from fetched comments
  const actualCommentCount = actualComments ? actualComments.length : 0;
  const [localCommentCount, setLocalCommentCount] = useState(actualCommentCount || commentsCount || _commentCount || 0);

  // Update local comment count when actual comments change
  useEffect(() => {
    if (actualComments) {
      setLocalCommentCount(actualComments.length);
    }
  }, [actualComments]);

  // Debug logging
  useEffect(() => {
    console.log('[DEBUG] PostCard - Comment counts:', {
      commentsCount,
      _commentCount,
      actualCommentCount,
      localCommentCount,
      postId
    });
  }, [commentsCount, _commentCount, actualCommentCount, localCommentCount, postId]);

  // No longer need to fetch user profile data individually since we get it from basicProfiles

  // Only update local state when props change and they're different
  useEffect(() => {
    if (JSON.stringify(upvotesArray) !== JSON.stringify(localUpvotes)) {
      setLocalUpvotes(upvotesArray);
    }
    if (JSON.stringify(downvotesArray) !== JSON.stringify(localDownvotes)) {
      setLocalDownvotes(downvotesArray);
    }
    // Only update from props if we don't have actual comments data
    if (!actualComments) {
      const newCommentCount = commentsCount || _commentCount || 0;
      if (newCommentCount !== localCommentCount) {
        setLocalCommentCount(newCommentCount);
      }
    }
  }, [upvotesArray, downvotesArray, commentsCount, _commentCount, localCommentCount, localUpvotes, localDownvotes, actualComments]);

  const handleCommentClick = () => {
    if (commentModalRef.current) {
      commentModalRef.current.showModal();
    }
  };

  return (
    <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
      <UserDetailsTab
        profileImage={userProfile.profilePhotoUrl}
        username={userProfile.username}
        timestamp={timestamp}
      />
      <div className="text-primary flex flex-col gap-2">
        <p>
          <span className="font-bold">📍 Barangay:</span> {barangay}
        </p>
        {coordinates && (
          <p>
            <span className="font-bold">📍 Coordinates:</span>{" "}
            {coordinates.join(", ")}
          </p>
        )}
        <p>
          <span className="font-bold">🕑 Date & Time:</span> {dateTime}
        </p>
        <p>
          <span className="font-bold">⚠️ Report Type:</span> {reportType}
        </p>
        <p className="font-bold">
          📝 Description: <br />
          <span
            className="font-normal block ml-1 max-h-24 overflow-hidden text-ellipsis break-words"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </span>
        </p>
      </div>

      <ImageGrid images={images} />

      <hr className="text-gray-200 mt-4 mb-2" />
      <ReactionsTab 
        postId={postId}
        upvotes={upvotes}
        downvotes={downvotes}
        commentsCount={localCommentCount}
        upvotesArray={localUpvotes}
        downvotesArray={localDownvotes}
        currentUserId={currentUserId}
        onCommentClick={handleCommentClick}
        iconSize={30}
        onVoteUpdate={(newUpvotes, newDownvotes) => {
          setLocalUpvotes(newUpvotes);
          setLocalDownvotes(newDownvotes);
          // Also call the parent's onVoteUpdate if provided
          onVoteUpdate?.(newUpvotes, newDownvotes);
        }}
      />
    
      <CommentModal 
        ref={commentModalRef}
        postId={postId}
        upvotes={upvotes}
        downvotes={downvotes}
        commentsCount={localCommentCount}
        upvotesArray={localUpvotes}
        downvotesArray={localDownvotes}
        onVoteUpdate={(newUpvotes, newDownvotes) => {
          setLocalUpvotes(newUpvotes);
          setLocalDownvotes(newDownvotes);
          // Also call the parent's onVoteUpdate if provided
          onVoteUpdate?.(newUpvotes, newDownvotes);
        }}
        onCommentAdded={() => {
          setLocalCommentCount(prev => prev + 1);
        }}
      />
    </div>
  );
};

export default PostCard;
