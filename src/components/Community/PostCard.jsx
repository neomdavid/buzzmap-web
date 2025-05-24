import React, { useState, useEffect, useRef } from "react";
import ReactionsTab from "./ReactionsTab";
import ImageGrid from "./ImageGrid";
import { UserDetailsTab } from "../";
import { useSelector } from "react-redux";
import CommentModal from "./CommentModal";
import { toastInfo } from "../../utils.jsx";

const PostCard = ({
  profileImage,
  username,
  timestamp,
  barangay, // Pass the barangay here
  coordinates, // Pass the coordinates here
  dateTime,
  reportType,
  description,
  likes,
  comments,
  shares,
  images = [],
  postId,
  upvotes,
  downvotes,
  commentsCount,
  upvotesArray = [],
  downvotesArray = [],
  _commentCount = 0, // Add this prop with default value
}) => {
  const userFromStore = useSelector((state) => state.auth?.user);
  const commentModalRef = useRef(null);

  const handleCommentClick = () => {
    if (commentModalRef.current) {
      commentModalRef.current.showModal();
    }
  };

  return (
    <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
      <UserDetailsTab
        profileImage={profileImage}
        username={username}
        timestamp={timestamp}
      />
      <div className="text-primary flex flex-col gap-2">
        <p>
          <span className="font-bold">📍 Barangay:</span> {barangay}
        </p>
        {coordinates && (
          <p>
            <span className="font-bold">📍 Coordinates:</span>{" "}
            {coordinates.join(", ")}
          </p>
        )}
        <p>
          <span className="font-bold">🕑 Date & Time:</span> {dateTime}
        </p>
        <p>
          <span className="font-bold">⚠️ Report Type:</span> {reportType}
        </p>
        <p className="font-bold">
          📝 Description: <br />
          <span
            className="font-normal block ml-1 max-h-24 overflow-hidden text-ellipsis break-words"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </span>
        </p>
      </div>

      <ImageGrid images={images} />

      <hr className="text-gray-200 mt-4 mb-2" />
      <ReactionsTab 
        postId={postId}
        upvotes={upvotes}
        downvotes={downvotes}
        commentsCount={_commentCount} // Use _commentCount here
        upvotesArray={upvotesArray}
        downvotesArray={downvotesArray}
        currentUserId={userFromStore?._id}
        onCommentClick={handleCommentClick}
        iconSize={30}
      />
    
      <CommentModal 
        ref={commentModalRef}
        postId={postId}
        upvotes={upvotes}
        downvotes={downvotes}
        commentsCount={_commentCount} // Use _commentCount here
        upvotesArray={upvotesArray}
        downvotesArray={downvotesArray}
        onCommentAdded={() => {
          // No need to reload the page, RTK Query will handle cache invalidation
        }}
      />
    </div>
  );
};

export default PostCard;
