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
    if (hasUpvoted) {
      // Remove upvote
      try {
        const response = await removeVoteReport(postId);
        console.log('[ReactionsTab DEBUG] Removed upvote:', response);
      } catch (error) {
        console.error('[ReactionsTab DEBUG] Remove upvote error:', error);
      }
    } else {
      // Upvote
      try {
        const response = await upvoteReport(postId);
        console.log('[ReactionsTab DEBUG] Upvote response:', response);
      } catch (error) {
        console.error('[ReactionsTab DEBUG] Upvote error:', error);
      }
    }
    // Debug state
    console.log('[ReactionsTab DEBUG] upvotesArray:', upvotesArray, 'currentUserId:', currentUserId, 'hasUpvoted:', hasUpvoted);
  };

  const handleDownvote = async () => {
    if (hasDownvoted) {
      // Remove downvote
      try {
        const response = await removeVoteReport(postId);
        console.log('[ReactionsTab DEBUG] Removed downvote:', response);
      } catch (error) {
        console.error('[ReactionsTab DEBUG] Remove downvote error:', error);
      }
    } else {
      // Downvote
      try {
        const response = await downvoteReport(postId);
        console.log('[ReactionsTab DEBUG] Downvote response:', response);
      } catch (error) {
        console.error('[ReactionsTab DEBUG] Downvote error:', error);
      }
    }
    // Debug state
    console.log('[ReactionsTab DEBUG] downvotesArray:', downvotesArray, 'currentUserId:', currentUserId, 'hasDownvoted:', hasDownvoted);
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
