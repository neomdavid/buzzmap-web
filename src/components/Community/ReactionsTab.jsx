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
  onVoteUpdate,
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

  // Check if the current user has voted using the shared state
  const hasUpvoted = currentUserId && upvotesArray.some(vote => 
    typeof vote === 'object' ? vote._id === currentUserId : vote === currentUserId
  );
  const hasDownvoted = currentUserId && downvotesArray.some(vote => 
    typeof vote === 'object' ? vote._id === currentUserId : vote === currentUserId
  );

  // Calculate net votes based on the shared arrays
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

    // Create new arrays for optimistic update
    let newUpvotes = [...upvotesArray];
    let newDownvotes = [...downvotesArray];

    if (hasUpvoted) {
      newUpvotes = newUpvotes.filter(vote => 
        typeof vote === 'object' ? vote._id !== currentUserId : vote !== currentUserId
      );
    } else {
      newUpvotes.push(currentUserId);
      // If user had downvoted, remove it
      if (hasDownvoted) {
        newDownvotes = newDownvotes.filter(vote => 
          typeof vote === 'object' ? vote._id !== currentUserId : vote !== currentUserId
        );
      }
    }

    // Update parent component immediately
    onVoteUpdate?.(newUpvotes, newDownvotes);

    try {
      if (hasUpvoted) {
        if (isAdminPost) {
          await removeAdminPostUpvote(postId).unwrap();
        } else {
          await removeUpvote(postId).unwrap();
        }
      } else {
        if (isAdminPost) {
          await upvoteAdminPost(postId).unwrap();
        } else {
          await upvoteReport(postId).unwrap();
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error handling upvote:', error);
      // Revert optimistic update on error
      onVoteUpdate?.(upvotesArray, downvotesArray);
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

    // Create new arrays for optimistic update
    let newUpvotes = [...upvotesArray];
    let newDownvotes = [...downvotesArray];

    if (hasDownvoted) {
      newDownvotes = newDownvotes.filter(vote => 
        typeof vote === 'object' ? vote._id !== currentUserId : vote !== currentUserId
      );
    } else {
      newDownvotes.push(currentUserId);
      // If user had upvoted, remove it
      if (hasUpvoted) {
        newUpvotes = newUpvotes.filter(vote => 
          typeof vote === 'object' ? vote._id !== currentUserId : vote !== currentUserId
        );
      }
    }

    // Update parent component immediately
    onVoteUpdate?.(newUpvotes, newDownvotes);

    try {
      if (hasDownvoted) {
        if (isAdminPost) {
          await removeAdminPostDownvote(postId).unwrap();
        } else {
          await removeDownvote(postId).unwrap();
        }
      } else {
        if (isAdminPost) {
          await downvoteAdminPost(postId).unwrap();
        } else {
          await downvoteReport(postId).unwrap();
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error handling downvote:', error);
      // Revert optimistic update on error
      onVoteUpdate?.(upvotesArray, downvotesArray);
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
