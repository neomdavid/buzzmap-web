import React, { useState } from "react";
import { ArrowFatUp, ArrowFatDown, ChatCircleDots } from "phosphor-react";
import { useUpvoteReportMutation, useDownvoteReportMutation, useRemoveVoteReportMutation } from "../../api/dengueApi";

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
}) => {
  const [upvoteReport] = useUpvoteReportMutation();
  const [downvoteReport] = useDownvoteReportMutation();
  const [removeVoteReport] = useRemoveVoteReportMutation();

  // Local state for optimistic updates
  const [localUpvotes, setLocalUpvotes] = useState(upvotesArray);
  const [localDownvotes, setLocalDownvotes] = useState(downvotesArray);

  const hasUpvoted = currentUserId && localUpvotes.includes(currentUserId);
  const hasDownvoted = currentUserId && localDownvotes.includes(currentUserId);

  const netVotes = localUpvotes.length - localDownvotes.length;

  const handleUpvote = async () => {
    if (!currentUserId) {
      console.log("User must be logged in to vote");
      return;
    }

    try {
      if (hasUpvoted) {
        // Optimistically remove upvote
        setLocalUpvotes(prev => prev.filter(id => id !== currentUserId));
        await removeVoteReport(postId).unwrap();
      } else if (hasDownvoted) {
        // Optimistically remove downvote and add upvote
        setLocalDownvotes(prev => prev.filter(id => id !== currentUserId));
        setLocalUpvotes(prev => [...prev, currentUserId]);
        await removeVoteReport(postId).unwrap();
        await upvoteReport(postId).unwrap();
      } else {
        // Optimistically add upvote
        setLocalUpvotes(prev => [...prev, currentUserId]);
        await upvoteReport(postId).unwrap();
      }
    } catch (error) {
      // Revert optimistic updates on error
      setLocalUpvotes(upvotesArray);
      setLocalDownvotes(downvotesArray);
      console.error('Error handling upvote:', error);
    }
  };

  const handleDownvote = async () => {
    if (!currentUserId) {
      console.log("User must be logged in to vote");
      return;
    }

    try {
      if (hasDownvoted) {
        // Optimistically remove downvote
        setLocalDownvotes(prev => prev.filter(id => id !== currentUserId));
        await removeVoteReport(postId).unwrap();
      } else if (hasUpvoted) {
        // Optimistically remove upvote and add downvote
        setLocalUpvotes(prev => prev.filter(id => id !== currentUserId));
        setLocalDownvotes(prev => [...prev, currentUserId]);
        await removeVoteReport(postId).unwrap();
        await downvoteReport(postId).unwrap();
      } else {
        // Optimistically add downvote
        setLocalDownvotes(prev => [...prev, currentUserId]);
        await downvoteReport(postId).unwrap();
      }
    } catch (error) {
      // Revert optimistic updates on error
      setLocalUpvotes(upvotesArray);
      setLocalDownvotes(downvotesArray);
      console.error('Error handling downvote:', error);
    }
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <ArrowFatUp
          size={iconSize}
          weight={hasUpvoted ? "fill" : "regular"}
          className={`cursor-pointer hover:opacity-80 ${hasUpvoted ? "text-success" : "text-gray-400"}`}
          onClick={handleUpvote}
        />
        <span className={`font-light ${textSize}`}>{netVotes}</span>
        <ArrowFatDown
          size={iconSize}
          weight={hasDownvoted ? "fill" : "regular"}
          className={`cursor-pointer hover:opacity-80 ${hasDownvoted ? "text-error" : "text-gray-400"}`}
          onClick={handleDownvote}
        />
      </div>
      <div className="flex items-center gap-x-2 py-2 px-2">
        <ChatCircleDots
          size={iconSize}
          className="cursor-pointer hover:opacity-80"
        />
        <span className={`font-light ${textSize}`}>{commentsCount}</span>
      </div>
    </div>
  );
};

export default ReactionsTab;
