import React, { useState, forwardRef, useRef } from "react";
import { useGetCommentsQuery, useAddCommentMutation } from "../../api/dengueApi";
import { Smiley, PaperPlaneRight } from "phosphor-react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useSelector } from "react-redux";
import { DotsThree } from "phosphor-react";
import ReactionsTab from "./ReactionsTab";
import Comment2 from "./Comment2";
import profile1 from "../../assets/profile1.png";
import { formatDistanceToNow } from "date-fns";

const CommentModal = forwardRef(({ postId, onCommentAdded }, ref) => {
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const userFromStore = useSelector((state) => state.auth?.user);
  const [addComment, { isLoading }] = useAddCommentMutation();
  const { data: comments, isLoading: isLoadingComments } = useGetCommentsQuery(postId);

  const handleTextareaChange = (e) => {
    setComment(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleEmojiClick = (emoji) => {
    setComment(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await addComment({ reportId: postId, content: comment.trim() }).unwrap();
      setComment("");
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const formatTimestamp = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "just now";
    }
  };

  return (
    <dialog id="comment_modal" ref={ref} className="modal text-xl text-primary">
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] flex flex-col p-0">
        {/* THIS IS WHERE THE REPORT INFO COMES FROM, I HAVE AN API TO GET ALL REPORTS OR GET REPORT  */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-8 py-6 pt-7 border-b border-gray-400/70">
          <div className="flex-1"></div>
          {/* this is the username of the user who made the report */}
          <p className="text-2xl font-bold">Jason Madrid's Post</p>
          <form method="dialog" className="flex-1 flex justify-end">
            <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost">
              ✕
            </button>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto py-5 pb-16">
          <div className="">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 px-6 mb-5">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="w-13 h-13 rounded-full bg-gray-400 self-center"></div>
                    <div className="flex flex-col text-lg">
                      {/* this is the username of the user who made the comment */}
                      <p className="font-bold">Jason Madrid</p>
                      {/* this is the timestamp of the comment */}
                      <p>2 hours ago</p>
                    </div>
                  </div>
                  <DotsThree size={28} />
                </div>
                <p className="text-black">happy birthday!!</p>
              </div>
              {/* this is the image of the report if there are images*/}
              <div className="w-full rounded-b-2xl bg-black flex justify-center items-center aspect-video max-h-170">
                <img src="https://upload.wikimedia.org/wikipedia/en/a/af/Drake_-_Views_cover.jpg" alt="Sample" className="w-full h-full object-contain" />
              </div>
              {/* this is the reactions tab, show the number of upvote and downvote of the report */}
              <div className="border-y border-gray-400/70 mx-2 my-3 mt-4 px-2 py-1"> 
                <ReactionsTab iconSize={22}/>
              </div>
            </div>
          </div>

          {/* this is where u now get all the comments of the report */}
          <div className="">
            <div className="flex flex-col gap-2.5 px-4 py-2 text-lg">
              {isLoadingComments ? (
                <div className="text-center py-4">Loading comments...</div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment2
                    key={comment._id || comment.id}
                    profileSize="h-12"
                    username={comment.user.username}
                    comment={comment.content}
                    timestamp={formatTimestamp(comment.createdAt)}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No comments yet</div>
              )}
            </div>
          </div>
        </div>

        {/* this is where u can add a comment */}
        <form onSubmit={handleSubmit} className="flex items-start gap-3 px-4 py-4 shadow-[0_-1px_4px_2px_rgba(0,0,0,0.08)]">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={userFromStore?.profileImage || profile1}
            alt="profile"
          />
          <div className="flex-1 z-10 flex flex-col text-black">
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={handleTextareaChange}
              placeholder="Write a public comment..."
              className="bg-gray-200/60 px-4 text-lg py-2 rounded-t-2xl outline-none text-base resize-none overflow-hidden max-h-130 min-h-[40px]"
              rows={1}
            />
            <div className="pt-2 gap-3 flex justify-between text-gray-600 bg-gray-200/60 rounded-b-2xl px-4 pb-2 relative shadow-[0_4px_12px_-4px_rgba(0,0,0,0.10)]">
              <div className="flex gap-3 relative">
                <button type="button" onClick={() => setShowEmojiPicker(v => !v)}>
                  <Smiley size={20}/>
                </button>
                {showEmojiPicker && (
                  <div className="absolute left-0 bottom-8 z-20">
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiClick}
                      theme="light"
                      previewPosition="none"
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!comment.trim() || isLoading}
                className="ml-2 text-gray-400 hover:text-primary disabled:opacity-50"
              >
                <PaperPlaneRight size={22} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
});

export default CommentModal;
