import React from "react";
import { ArrowFatUp, ArrowFatDown, ChatCircleDots } from "phosphor-react";
import {
  useUpvoteReportMutation,
  useDownvoteReportMutation,
  useRemoveVoteReportMutation,
} from "../../api/dengueApi";

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
  onCommentClick
}) => {
  const [upvoteReport] = useUpvoteReportMutation();
  const [downvoteReport] = useDownvoteReportMutation();
  const [removeVoteReport] = useRemoveVoteReportMutation();

  const hasUpvoted = currentUserId && upvotesArray.includes(currentUserId);
  const hasDownvoted = currentUserId && downvotesArray.includes(currentUserId);

  const netVotes = upvotes - downvotes;

  const handleUpvote = async () => {
    if (hasUpvoted) {
      // Remove upvote
      try {
        await removeVoteReport(postId);
      } catch (error) {
        console.error('Error removing upvote:', error);
      }
    } else {
      // Upvote
      try {
        await upvoteReport(postId);
      } catch (error) {
        console.error('Error upvoting:', error);
      }
    }
  };

  const handleDownvote = async () => {
    if (hasDownvoted) {
      // Remove downvote
      try {
        await removeVoteReport(postId);
      } catch (error) {
        console.error('Error removing downvote:', error);
      }
    } else {
      // Downvote
      try {
        await downvoteReport(postId);
      } catch (error) {
        console.error('Error downvoting:', error);
      }
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
          onClick={onCommentClick}
        />
        <span className={`font-light ${textSize}`}>{commentsCount}</span>
      </div>
    </div>
  );
};

export default ReactionsTab;
