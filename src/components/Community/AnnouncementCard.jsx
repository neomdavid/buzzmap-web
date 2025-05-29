import React, { useState } from "react";
import surveillanceLogo from "../../assets/icons/quezon_surveillance.png";
import announcementImg from "../../assets/announcementimg.png"; // Default image
import profile1 from "../../assets/profile1.png";

import { DotsThree, PaperPlaneRight } from "phosphor-react";
import ImageGrid from "./ImageGrid";
import ReactionsTab from "./ReactionsTab";
import Comment2 from "./Comment2";
import { useSelector } from "react-redux";
import { useGetAdminPostCommentsQuery, useAddAdminPostCommentMutation } from "../../api/dengueApi";
import { showCustomToast } from "../../utils.jsx";
import { formatDistanceToNow } from "date-fns";

const AnnouncementCard = ({ announcement }) => { // Accept announcement as a prop
  const [comment, setComment] = useState("");
  const userFromStore = useSelector((state) => state.auth?.user);
  const { data: comments, isLoading: isLoadingComments, refetch } = useGetAdminPostCommentsQuery(announcement?._id);
  const [addComment] = useAddAdminPostCommentMutation();

  // Use dynamic data if available, otherwise fallback to static/default values
  const title = announcement?.title || "Important Announcement";
  // Split content by newline characters for rendering paragraphs
  const contentParts = announcement?.content?.split('\n') || [
    "🚨 DENGUE OUTBREAK IN QUEZON CITY! 🚨",
    "",
    "Quezon City is currently facing a dengue outbreak, with cases surging by 200% from January 1 to February 14. Residents are urged to take immediate precautions to prevent the spread of the disease.",
    "",
    "🔴 What You Need to Know:",
    "✅ Dengue cases have drastically increased—stay alert!",
    "Read more...",
  ];
  const images = announcement?.images && announcement.images.length > 0 ? announcement.images : [announcementImg];
  // For simplicity, reactions are kept static for now, but could also be dynamic
  const likes = announcement?.likesCount || "100k"; // Assuming likesCount might come from data
  const commentsCount = announcement?.commentsCount || "43k"; // Assuming commentsCount might come from data
  const shares = announcement?.sharesCount || "20k"; // Assuming sharesCount might come from data

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      if (diffMinutes < 1) {
        return "just now";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "just now";
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!userFromStore) {
      showCustomToast("Please log in to comment", "error");
      return;
    }
    if (!comment.trim()) return;
    try {
      await addComment({ postId: announcement._id, content: comment.trim() }).unwrap();
      setComment("");
      refetch();
    } catch (error) {
      console.error("Failed to add comment:", error);
      showCustomToast("Failed to add comment", "error");
    }
  };

  return (
    <div className="flex flex-col">
      <section className="bg-primary text-white flex flex-col p-6 py-6 rounded-2xl">
        <div className="flex justify-between mb-8">
          <div className="flex gap-x-3">
            <img src={surveillanceLogo} className="h-14" />
            <div className="flex flex-col">
              {/* Use dynamic title */}
              <h1 className="text-4xl">{title}</h1>
              <p className="font-semibold text-[12px]">
                <span className="font-normal">From</span> Quezon City
                Epidemiology & Surveillance Division (CESU)
              </p>
              <p className="font-semibold text-[12px]">{formatTimestamp(announcement?.publishDate)}</p>
            </div>
          </div>
          <DotsThree size={32} />
        </div>

        <div className="mb-4">
          {/* Render content parts as paragraphs */}
          {contentParts.map((part, index) => (
            <p key={index} className={part.includes("Read more...") ? "italic underline font-semibold" : ""}>
              {part === "" ? <br /> : part}
            </p>
          ))}
          {/* Use dynamic images */}
          {images.length > 0 && (
            <div className="mt-4">
              {/* Assuming ImageGrid can handle an array of URLs */}
              <ImageGrid images={images} sourceType={announcement?.images ? "url" : "import"} />
            </div>
          )}
        </div>

        <div>
          <ReactionsTab
            postId={announcement?._id}
            upvotes={announcement?.upvotes?.length || 0}
            downvotes={announcement?.downvotes?.length || 0}
            commentsCount={comments?.length || 0}
            iconSize={21}
            textSize="text-lg"
            className={"mb-2"}
            upvotesArray={announcement?.upvotes || []}
            downvotesArray={announcement?.downvotes || []}
            currentUserId={userFromStore?._id}
            onCommentClick={() => {}}
            useCustomToast={true}
            onShowToast={showCustomToast}
            isAdminPost={true}
            userFromStore={userFromStore}
          />
          <hr className="text-white opacity-35 mb-4" />
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex">
            <img src={profile1} className="h-11 w-11 rounded-full mr-3" />
            <div className="flex-1 flex items-center">
              <input
                className="bg-white opacity-93 rounded-2xl placeholder-primary/70 px-4 w-full h-full text-primary focus:outline-none"
                placeholder={!userFromStore || userFromStore.role !== "user" ? "Log in to comment on this post..." : "Comment on this post..."}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!userFromStore || userFromStore.role !== "user"}
              />
              <button
                type="submit"
                disabled={!userFromStore || userFromStore.role !== "user" || !comment.trim()}
                className="ml-2 p-2 cursor-pointer text-white hover:text-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <PaperPlaneRight size={24} weight="fill" />
              </button>
            </div>
          </form>
        </div>
      </section>
          
      <section className="py-4 px-4">
        <p className="text-primary mb-4 opacity-65 font-semibold text-lg">
          Comments from the Community
        </p>
        <div>
          <div className="flex flex-col gap-4">
            {isLoadingComments ? (
              <div className="text-center py-4">Loading comments...</div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Comment2
                  key={comment._id}
                  username={comment.user.username}
                  comment={comment.content}
                  timestamp={formatTimestamp(comment.createdAt)}
                  commentId={comment._id}
                  upvotesArray={comment.upvotes || []}
                  downvotesArray={comment.downvotes || []}
                  currentUserId={userFromStore?._id}
                  onShowToast={showCustomToast}
                  isAdminPostComment={true}
                  userFromStore={userFromStore}
                />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No comments yet</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnnouncementCard;
