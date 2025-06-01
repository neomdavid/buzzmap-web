import React from "react";
import profile1 from "../../assets/profile1.png";
import { ArrowFatUp, ArrowFatDown } from "phosphor-react";
import {
  useUpvoteCommentMutation,
  useDownvoteCommentMutation,
  useRemoveCommentUpvoteMutation,
  useRemoveCommentDownvoteMutation,
  useUpvoteAdminPostCommentMutation,
  useDownvoteAdminPostCommentMutation,
  useRemoveAdminPostCommentUpvoteMutation,
  useRemoveAdminPostCommentDownvoteMutation,
} from "../../api/dengueApi";
import { showCustomToast } from "../../utils.jsx";

const Comment2 = ({
  username,
  profileImg = profile1,
  comment,
  timestamp,
  bgColor = "bg-base-200",
  profileSize = "h-11",
  textSize = "text-base",
  commentId,
  upvotesArray = [],
  downvotesArray = [],
  currentUserId = null,
  onShowToast,
  isAdminPostComment = false,
  userFromStore = null,
  onVoteUpdate,
}) => {
  // Regular comment mutations
  const [upvoteComment] = useUpvoteCommentMutation();
  const [downvoteComment] = useDownvoteCommentMutation();
  const [removeCommentUpvote] = useRemoveCommentUpvoteMutation();
  const [removeCommentDownvote] = useRemoveCommentDownvoteMutation();

  // Admin post comment mutations
  const [upvoteAdminPostComment] = useUpvoteAdminPostCommentMutation();
  const [downvoteAdminPostComment] = useDownvoteAdminPostCommentMutation();
  const [removeAdminPostCommentUpvote] = useRemoveAdminPostCommentUpvoteMutation();
  const [removeAdminPostCommentDownvote] = useRemoveAdminPostCommentDownvoteMutation();

  // Check if the current user has voted
  const hasUpvoted = currentUserId && upvotesArray.some(vote => 
    typeof vote === 'object' ? vote._id === currentUserId : vote === currentUserId
  );
  const hasDownvoted = currentUserId && downvotesArray.some(vote => 
    typeof vote === 'object' ? vote._id === currentUserId : vote === currentUserId
  );

  // Calculate net votes
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
        if (isAdminPostComment) {
          await removeAdminPostCommentUpvote(commentId).unwrap();
        } else {
          await removeCommentUpvote(commentId).unwrap();
        }
      } else {
        if (isAdminPostComment) {
          await upvoteAdminPostComment(commentId).unwrap();
        } else {
          await upvoteComment(commentId).unwrap();
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error handling comment upvote:', error);
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
        if (isAdminPostComment) {
          await removeAdminPostCommentDownvote(commentId).unwrap();
        } else {
          await removeCommentDownvote(commentId).unwrap();
        }
      } else {
        if (isAdminPostComment) {
          await downvoteAdminPostComment(commentId).unwrap();
        } else {
          await downvoteComment(commentId).unwrap();
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error handling comment downvote:', error);
      // Revert optimistic update on error
      onVoteUpdate?.(upvotesArray, downvotesArray);
      if (onShowToast) {
        onShowToast("Failed to update vote", "error");
      }
    }
  };

  return (
    <div className="flex gap-x-2 text-primary">
      <img src={profileImg} alt={username} className={`${profileSize} mt-2 rounded-full`} />
      <div>
        <div className={`flex flex-col rounded-3xl px-6 pt-3 pb-3 ${bgColor}`}>
          <p className={`font-bold ${textSize}`}>{username}</p>
          <p className={textSize}>{comment}</p>
        </div>
        <div className="flex text-sm font-semibold gap-x-4 ml-6 mt-1">
          <p>{timestamp}</p>
          <div className="flex items-center gap-x-1">
            <ArrowFatUp
              size={18}
              weight={hasUpvoted ? "fill" : "regular"}
              className={`cursor-pointer hover:opacity-50 ${hasUpvoted ? "text-success" : "text-gray-400"}`}
              onClick={handleUpvote}
            />
            <span>{netVotes}</span>
            <ArrowFatDown
              size={18}
              weight={hasDownvoted ? "fill" : "regular"}
              className={`cursor-pointer hover:opacity-50 ${hasDownvoted ? "text-error" : "text-gray-400"}`}
              onClick={handleDownvote}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment2;
