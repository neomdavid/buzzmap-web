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
  const expectedStateRef = useRef(null);
  const votingTimeoutRef = useRef(null);
  const lastVoteTime = useRef(0);
  const VOTE_DEBOUNCE_MS = 500; // 500ms debounce

  // Calculate net votes from arrays (more reliable than count props)
  const upvoteCount = Array.isArray(upvotesArray)
    ? upvotesArray.length
    : upvotes || 0;
  const downvoteCount = Array.isArray(downvotesArray)
    ? downvotesArray.length
    : downvotes || 0;
  const netVotes = upvoteCount - downvoteCount;

  // Check if current user has voted
  const hasUpvoted =
    Array.isArray(upvotesArray) &&
    upvotesArray.some((vote) =>
      typeof vote === "object"
        ? vote._id === currentUserId
        : vote === currentUserId
    );
  const hasDownvoted =
    Array.isArray(downvotesArray) &&
    downvotesArray.some((vote) =>
      typeof vote === "object"
        ? vote._id === currentUserId
        : vote === currentUserId
    );

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
    // Expectation: after action, user should have upvoted and not downvoted
    expectedStateRef.current = {
      type: "upvote",
      expectHasUpvoted: !hasUpvoted,
      expectHasDownvoted: false,
    };
    // Fallback timeout to re-enable even if refetch delays
    clearTimeout(votingTimeoutRef.current);
    votingTimeoutRef.current = setTimeout(() => {
      setIsVoting(false);
      expectedStateRef.current = null;
    }, 5000);

    if (!currentUserId) {
      if (onShowToast) {
        onShowToast("Please log in to vote", "error");
      } else {
        showCustomToast("Please log in to vote", "error");
      }
      setIsVoting(false);
      return;
    }

    try {
      if (hasUpvoted) {
        // Remove upvote
        if (isAdminPost) {
          await removeAdminPostUpvote(postId).unwrap();
        } else {
          await removeUpvote(postId).unwrap();
        }
        // Wait for refetch to update counts
      } else {
        // Add upvote
        if (isAdminPost) {
          await upvoteAdminPost(postId).unwrap();
        } else {
          await upvoteReport(postId).unwrap();
        }
        // Wait for refetch to update counts
      }
    } catch (error) {
      console.error("[VOTE] Failed to upvote post:", postId, error);
      if (onShowToast) {
        onShowToast("Failed to vote. Please try again.", "error");
      } else {
        showCustomToast("Failed to vote. Please try again.", "error");
      }
    } finally {
      // Wait for prop changes to re-enable (handled by effect)
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
    // Expectation: after action, user should have downvoted and not upvoted
    expectedStateRef.current = {
      type: "downvote",
      expectHasUpvoted: false,
      expectHasDownvoted: !hasDownvoted,
    };
    // Fallback timeout
    clearTimeout(votingTimeoutRef.current);
    votingTimeoutRef.current = setTimeout(() => {
      setIsVoting(false);
      expectedStateRef.current = null;
    }, 5000);

    if (!currentUserId) {
      if (onShowToast) {
        onShowToast("Please log in to vote", "error");
      } else {
        showCustomToast("Please log in to vote", "error");
      }
      setIsVoting(false);
      return;
    }

    try {
      if (hasDownvoted) {
        // Remove downvote
        if (isAdminPost) {
          await removeAdminPostDownvote(postId).unwrap();
        } else {
          await removeDownvote(postId).unwrap();
        }
        // Wait for refetch to update counts
      } else {
        // Add downvote
        if (isAdminPost) {
          await downvoteAdminPost(postId).unwrap();
        } else {
          await downvoteReport(postId).unwrap();
        }
        // Wait for refetch to update counts
      }
    } catch (error) {
      console.error("[VOTE] Failed to downvote post:", postId, error);
      if (onShowToast) {
        onShowToast("Failed to vote. Please try again.", "error");
      } else {
        showCustomToast("Failed to vote. Please try again.", "error");
      }
    } finally {
      // Wait for prop changes to re-enable (handled by effect)
    }
  };

  // Re-enable buttons when backend-refetched arrays reflect expected state
  React.useEffect(() => {
    if (!isVoting || !expectedStateRef.current) return;
    const { expectHasUpvoted, expectHasDownvoted } = expectedStateRef.current;
    const currentHasUp =
      Array.isArray(upvotesArray) &&
      upvotesArray.some((vote) =>
        typeof vote === "object"
          ? vote._id === currentUserId
          : vote === currentUserId
      );
    const currentHasDown =
      Array.isArray(downvotesArray) &&
      downvotesArray.some((vote) =>
        typeof vote === "object"
          ? vote._id === currentUserId
          : vote === currentUserId
      );
    if (
      currentHasUp === expectHasUpvoted &&
      currentHasDown === expectHasDownvoted
    ) {
      setIsVoting(false);
      expectedStateRef.current = null;
      clearTimeout(votingTimeoutRef.current);
    }
  }, [upvotesArray, downvotesArray, currentUserId, isVoting]);

  React.useEffect(() => () => clearTimeout(votingTimeoutRef.current), []);

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
          onClick={(e) => {
            e.stopPropagation();
            if (!isVoting) handleUpvote();
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            if (!isVoting) handleDownvote();
          }}
        />
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick?.();
        }}
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
