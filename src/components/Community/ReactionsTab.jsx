import React from "react";
import { ArrowFatUp, ArrowFatDown, ChatCircleDots } from "phosphor-react";
import {
  useUpvoteReportMutation,
  useDownvoteReportMutation,
  useRemoveUpvoteMutation,
  useRemoveDownvoteMutation,
  useUpvoteAdminPostMutation,
  useDownvoteAdminPostMutation,
  useRemoveAdminPostUpvoteMutation,
  useRemoveAdminPostDownvoteMutation,
} from "../../api/dengueApi";
import { showCustomToast } from "../../utils.jsx";

const ReactionsTab = ({
  postId,
  upvotes = 0,
  downvotes = 0,
  commentsCount = 0,
  iconSize = 18,
  textSize = "text-md",
  className,
  upvotesArray = [],
  downvotesArray = [],
  currentUserId = null,
  onCommentClick,
  useCustomToast = false,
  onShowToast,
  isAdminPost = false,
  userFromStore = null,
}) => {
  // Regular post mutations
  const [upvoteReport] = useUpvoteReportMutation();
  const [downvoteReport] = useDownvoteReportMutation();
  const [removeUpvote] = useRemoveUpvoteMutation();
  const [removeDownvote] = useRemoveDownvoteMutation();

  // Admin post mutations
  const [upvoteAdminPost] = useUpvoteAdminPostMutation();
  const [downvoteAdminPost] = useDownvoteAdminPostMutation();
  const [removeAdminPostUpvote] = useRemoveAdminPostUpvoteMutation();
  const [removeAdminPostDownvote] = useRemoveAdminPostDownvoteMutation();

  // Check if the current user has voted
  const hasUpvoted = currentUserId && upvotesArray.some(vote => 
    typeof vote === 'object' ? vote._id === currentUserId : vote === currentUserId
  );
  const hasDownvoted = currentUserId && downvotesArray.some(vote => 
    typeof vote === 'object' ? vote._id === currentUserId : vote === currentUserId
  );

  // Calculate net votes based on the length of the arrays
  const netVotes = (Array.isArray(upvotesArray) ? upvotesArray.length : 0) - 
                  (Array.isArray(downvotesArray) ? downvotesArray.length : 0);

  const handleUpvote = async () => {
    if (!currentUserId) {
      if (onShowToast) {
        onShowToast("Please log in to vote", "error");
      } else {
        showCustomToast("Please log in to vote", "error");
      }
      return;
    }
    try {
      if (hasUpvoted) {
        // Remove upvote
        console.log('[DEBUG] Removing upvote from post:', postId);
        if (isAdminPost) {
          await removeAdminPostUpvote(postId).unwrap();
        } else {
          await removeUpvote(postId).unwrap();
        }
      } else {
        // Upvote
        console.log('[DEBUG] Adding upvote to post:', postId);
        if (isAdminPost) {
          await upvoteAdminPost(postId).unwrap();
        } else {
          await upvoteReport(postId).unwrap();
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error handling upvote:', error);
      if (onShowToast) {
        onShowToast("Failed to update vote", "error");
      }
    }
  };

  const handleDownvote = async () => {
    if (!currentUserId) {
      if (onShowToast) {
        onShowToast("Please log in to vote", "error");
      } else {
        showCustomToast("Please log in to vote", "error");
      }
      return;
    }
    try {
      if (hasDownvoted) {
        // Remove downvote
        console.log('[DEBUG] Removing downvote from post:', postId);
        if (isAdminPost) {
          await removeAdminPostDownvote(postId).unwrap();
        } else {
          await removeDownvote(postId).unwrap();
        }
      } else {
        // Downvote
        console.log('[DEBUG] Adding downvote to post:', postId);
        if (isAdminPost) {
          await downvoteAdminPost(postId).unwrap();
        } else {
          await downvoteReport(postId).unwrap();
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error handling downvote:', error);
      if (onShowToast) {
        onShowToast("Failed to update vote", "error");
      }
    }
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <ArrowFatUp
          size={iconSize}
          weight={hasUpvoted ? "fill" : "regular"}
          className={`cursor-pointer hover:bg-gray-200/80 rounded-full p-1.5 ${hasUpvoted ? "text-success" : "text-gray-400"}`}
          onClick={handleUpvote}
        />
        <span className={`font-normal ${textSize}`}>{netVotes}</span>
        <ArrowFatDown
          size={iconSize}
          weight={hasDownvoted ? "fill" : "regular"}
          className={`cursor-pointer hover:bg-gray-200/80 rounded-full p-1.5 ${hasDownvoted ? "text-error" : "text-gray-400"}`}
          onClick={handleDownvote}
        />
      </div>
      <div onClick={onCommentClick} className="flex items-center cursor-pointer gap-x-2 py-1 px-3 pr-4 hover:bg-gray-200/80 rounded-full">
        <ChatCircleDots
          size={iconSize}
          className="rounded-full text-gray-400 p-1.5"
        />
        <span className={`font-light ${textSize}`}>{commentsCount}</span>
      </div>
    </div>
  );
};

export default ReactionsTab;
