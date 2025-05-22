import React from "react";
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

  const hasUpvoted = currentUserId && upvotesArray.includes(currentUserId);
  const hasDownvoted = currentUserId && downvotesArray.includes(currentUserId);

  const netVotes = upvotes - downvotes;

  const handleUpvote = async () => {
    if (!currentUserId) {
      console.log("User must be logged in to vote");
      return;
    }

    try {
      if (hasUpvoted) {
        // Remove upvote
        await removeVoteReport(postId).unwrap();
      } else if (hasDownvoted) {
        // Remove downvote and add upvote
        await removeVoteReport(postId).unwrap();
        await upvoteReport(postId).unwrap();
      } else {
        // Add upvote
        await upvoteReport(postId).unwrap();
      }
    } catch (error) {
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
        // Remove downvote
        await removeVoteReport(postId).unwrap();
      } else if (hasUpvoted) {
        // Remove upvote and add downvote
        await removeVoteReport(postId).unwrap();
        await downvoteReport(postId).unwrap();
      } else {
        // Add downvote
        await downvoteReport(postId).unwrap();
      }
    } catch (error) {
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
