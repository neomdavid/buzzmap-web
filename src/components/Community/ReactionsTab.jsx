import React, { useState, useRef } from "react";
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
import { useLocalStorageVoting } from "../../hooks/useLocalStorageVoting";

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
  // State for preventing rapid clicking
  const [isVoting, setIsVoting] = useState(false);
  const lastVoteTime = useRef(0);
  const VOTE_DEBOUNCE_MS = 500; // 500ms debounce

  // Use localStorage-based voting
  const {
    upvotes: localUpvotes,
    downvotes: localDownvotes,
    netVotes,
    updateVotes,
    getUserVoteStatus,
  } = useLocalStorageVoting(postId, upvotesArray, downvotesArray);

  // Get current user's vote status from localStorage
  const { hasUpvoted, hasDownvoted } = getUserVoteStatus(currentUserId);

  // Regular post mutations (for background sync)
  const [upvoteReport] = useUpvoteReportMutation();
  const [downvoteReport] = useDownvoteReportMutation();
  const [removeUpvote] = useRemoveUpvoteMutation();
  const [removeDownvote] = useRemoveDownvoteMutation();

  // Admin post mutations (for background sync)
  const [upvoteAdminPost] = useUpvoteAdminPostMutation();
  const [downvoteAdminPost] = useDownvoteAdminPostMutation();
  const [removeAdminPostUpvote] = useRemoveAdminPostUpvoteMutation();
  const [removeAdminPostDownvote] = useRemoveAdminPostDownvoteMutation();

  const handleUpvote = async () => {
    // Debounce rapid clicking
    const now = Date.now();
    if (now - lastVoteTime.current < VOTE_DEBOUNCE_MS || isVoting) {
      return;
    }
    lastVoteTime.current = now;
    setIsVoting(true);

    if (!currentUserId) {
      if (onShowToast) {
        onShowToast("Please log in to vote", "error");
      } else {
        showCustomToast("Please log in to vote", "error");
      }
      setIsVoting(false);
      return;
    }

    // Create new arrays for localStorage update
    let newUpvotes = [...localUpvotes];
    let newDownvotes = [...localDownvotes];

    if (hasUpvoted) {
      // Remove upvote
      newUpvotes = newUpvotes.filter((vote) =>
        typeof vote === "object"
          ? vote._id !== currentUserId
          : vote !== currentUserId
      );
    } else {
      // Add upvote
      newUpvotes.push(currentUserId);
      // If user had downvoted, remove it
      if (hasDownvoted) {
        newDownvotes = newDownvotes.filter((vote) =>
          typeof vote === "object"
            ? vote._id !== currentUserId
            : vote !== currentUserId
        );
      }
    }

    // Update localStorage immediately (instant UI update)
    updateVotes(newUpvotes, newDownvotes);

    // Update parent component for consistency
    onVoteUpdate?.(newUpvotes, newDownvotes);

    // Background API call (non-blocking)
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
      console.log("[VOTE] Background sync successful for post:", postId);
    } catch (error) {
      console.error("[VOTE] Background sync failed for post:", postId, error);
      // Don't revert localStorage - keep the optimistic update
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    // Debounce rapid clicking
    const now = Date.now();
    if (now - lastVoteTime.current < VOTE_DEBOUNCE_MS || isVoting) {
      return;
    }
    lastVoteTime.current = now;
    setIsVoting(true);

    if (!currentUserId) {
      if (onShowToast) {
        onShowToast("Please log in to vote", "error");
      } else {
        showCustomToast("Please log in to vote", "error");
      }
      setIsVoting(false);
      return;
    }

    // Create new arrays for localStorage update
    let newUpvotes = [...localUpvotes];
    let newDownvotes = [...localDownvotes];

    if (hasDownvoted) {
      // Remove downvote
      newDownvotes = newDownvotes.filter((vote) =>
        typeof vote === "object"
          ? vote._id !== currentUserId
          : vote !== currentUserId
      );
    } else {
      // Add downvote
      newDownvotes.push(currentUserId);
      // If user had upvoted, remove it
      if (hasUpvoted) {
        newUpvotes = newUpvotes.filter((vote) =>
          typeof vote === "object"
            ? vote._id !== currentUserId
            : vote !== currentUserId
        );
      }
    }

    // Update localStorage immediately (instant UI update)
    updateVotes(newUpvotes, newDownvotes);

    // Update parent component for consistency
    onVoteUpdate?.(newUpvotes, newDownvotes);

    // Background API call (non-blocking)
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
      console.log("[VOTE] Background sync successful for post:", postId);
    } catch (error) {
      console.error("[VOTE] Background sync failed for post:", postId, error);
      // Don't revert localStorage - keep the optimistic update
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <ArrowFatUp
          size={iconSize}
          weight={hasUpvoted ? "fill" : "regular"}
          className={`${
            isVoting
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-200/80"
          } rounded-full p-1.5 ${
            hasUpvoted ? "text-success" : "text-gray-400"
          }`}
          onClick={isVoting ? undefined : handleUpvote}
        />
        <span className={`font-normal ${textSize}`}>{netVotes}</span>
        <ArrowFatDown
          size={iconSize}
          weight={hasDownvoted ? "fill" : "regular"}
          className={`${
            isVoting
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-200/80"
          } rounded-full p-1.5 ${
            hasDownvoted ? "text-error" : "text-gray-400"
          }`}
          onClick={isVoting ? undefined : handleDownvote}
        />
      </div>
      <div
        onClick={onCommentClick}
        className="flex items-center cursor-pointer gap-x-2 py-1 px-3 pr-4 hover:bg-gray-200/80 rounded-full"
      >
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
