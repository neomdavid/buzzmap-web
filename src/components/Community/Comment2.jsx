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
  userFromStore = null
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
        console.log('[DEBUG] Removing upvote from comment:', commentId);
        if (isAdminPostComment) {
          await removeAdminPostCommentUpvote(commentId).unwrap();
        } else {
          await removeCommentUpvote(commentId).unwrap();
        }
      } else {
        // Upvote
        console.log('[DEBUG] Adding upvote to comment:', commentId);
        if (isAdminPostComment) {
          await upvoteAdminPostComment(commentId).unwrap();
        } else {
          await upvoteComment(commentId).unwrap();
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
        console.log('[DEBUG] Removing downvote from comment:', commentId);
        if (isAdminPostComment) {
          await removeAdminPostCommentDownvote(commentId).unwrap();
        } else {
          await removeCommentDownvote(commentId).unwrap();
        }
      } else {
        // Downvote
        console.log('[DEBUG] Adding downvote to comment:', commentId);
        if (isAdminPostComment) {
          await downvoteAdminPostComment(commentId).unwrap();
        } else {
          await downvoteComment(commentId).unwrap();
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
    <div className="flex gap-x-1.5 text-black">
      <img src={profileImg} alt={username} className={`${profileSize} mt-1.5 rounded-full`} />
      <div>
        <div className={`flex flex-col rounded-3xl px-6 pl-5 pt-3 pb-3 bg-gray-200/50`}>
          <p className={`font-bold ${textSize}`}>{username}</p>
          <p className={textSize}>{comment}</p>
        </div>
        <div className="flex items-center text-sm font-semibold gap-x-4 ml-6 mt-1">
          <p>{timestamp}</p>
          <ArrowFatUp 
            size={22} 
            weight={hasUpvoted ? "fill" : "regular"}
            className={`cursor-pointer hover:bg-gray-200/50 rounded-full p-1 ${hasUpvoted ? "text-success" : "text-gray-400"}`}
            onClick={handleUpvote}
          />
          <span className="font-normal">{netVotes}</span>
          <ArrowFatDown 
            size={22} 
            weight={hasDownvoted ? "fill" : "regular"}
            className={`cursor-pointer hover:bg-gray-200/50 rounded-full p-1 ${hasDownvoted ? "text-error" : "text-gray-400"}`}
            onClick={handleDownvote}
          />
        </div>
      </div>
    </div>
  );
};

export default Comment2;
