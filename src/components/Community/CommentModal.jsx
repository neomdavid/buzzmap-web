import React, { useState, forwardRef, useRef } from "react";
import { useGetCommentsQuery, useAddCommentMutation } from "../../api/dengueApi";
import { Smiley, Sticker, PaperPlaneRight } from "phosphor-react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useSelector } from "react-redux";
import UserDetailsTab from "../UserDetailsTab";
import { DotsThree } from "phosphor-react";
import ReactionsTab from "./ReactionsTab";
import Comment from "./Comment";
import Comment2 from "./Comment2";
import profile1 from "../../assets/profile1.png";

const STICKERS = [
  { name: "Dog", url: "https://cdn-icons-png.flaticon.com/512/616/616408.png" },
  { name: "Cat", url: "https://cdn-icons-png.flaticon.com/512/616/616408.png" },
  { name: "Star", url: "https://cdn-icons-png.flaticon.com/512/616/616408.png" }
];

const CommentModal = forwardRef(({ postId, onCommentAdded }, ref) => {
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
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

  const handleStickerClick = (sticker) => {
    setComment(prev => prev + ` [${sticker.name}]`);
    setShowStickerPicker(false);
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await addComment({ reportId: postId, comment: comment.trim() }).unwrap();
      setComment("");
      if (onCommentAdded) {
        onCommentAdded();
      }
      // Close the modal
      const dlg = document.getElementById("comment_modal");
      if (dlg) dlg.close();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <dialog id="comment_modal" ref={ref} className="modal text-xl text-primary">
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] flex flex-col p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-8 py-6 pt-7 border-b border-gray-400/70">
          <div className="flex-1"></div>
          <p className="text-2xl font-bold">Jason Madrid's Post</p>
          <form method="dialog" className="flex-1 flex justify-end">
            <button className="btn btn-sm text-3xl font-bold btn-circle btn-ghost">
              ✕
            </button>
          </form>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 pb-16">
          <div className="">
            <div className="flex flex-col">
              <div className="flex flex-col gap-4 px-6 mb-5">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="w-13 h-13 rounded-full bg-gray-400 self-center"></div>
                    <div className="flex flex-col text-lg">
                      <p className="font-bold">Jason Madrid</p>
                      <p>2 hours ago</p>
                    </div>
                  </div>
                  <DotsThree size={28} />
                </div>
                <p className="text-black">happy birthday!!</p>
              </div>
              <div className="w-full rounded-b-2xl  bg-black flex justify-center items-center aspect-video max-h-170">
                <img src="https://upload.wikimedia.org/wikipedia/en/a/af/Drake_-_Views_cover.jpg" alt="Sample" className="w-full h-full object-contain" />
              </div>
              <div className="border-y border-gray-400/70 mx-2 my-3 mt-4 px-2 py-1"> 
                 <ReactionsTab iconSize={22}/>
               </div>
             
            </div>
          </div>
          <div className="flex flex-col gap-2.5 px-4 py-2 text-lg">
             <Comment2 profileSize="h-12" username="Jason Madrid"  comment="happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!happy birthday!!" />
             <Comment2 profileSize="h-12" username="Jason Madrid"  comment="happy birthday!!" />

          </div>
          {/* ...rest of your content... */}
        </div>
        {/* Footer */}
        <form onSubmit={handleSubmit} className="flex items-start gap-3  px-4 py-4 border-t">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={userFromStore?.profileImage || profile1}
            alt="profile"
          />
          <div className="flex-1 flex flex-col text-black ">
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={handleTextareaChange}
              placeholder="Write a public comment..."
              className="bg-gray-200/60 px-4 text-lg py-2 rounded-t-2xl outline-none text-base resize-none overflow-hidden max-h-130 min-h-[40px]"
              rows={1}
            />
            <div className="pt-2 gap-3 flex justify-between text-gray-600 bg-gray-200/60 rounded-b-2xl px-4 pb-2 relative">
              <div className="flex gap-3 relative">
                <button type="button" onClick={() => { setShowEmojiPicker(v => !v); setShowStickerPicker(false); }}>
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
                <button type="button" onClick={() => { setShowStickerPicker(v => !v); setShowEmojiPicker(false); }}>
                  <Sticker size={20}/>
                </button>
                {showStickerPicker && (
                  <div className="absolute left-10 bottom-8 z-20 bg-white border rounded shadow p-2 flex gap-2">
                    {STICKERS.map(sticker => (
                      <button key={sticker.name} type="button" onClick={() => handleStickerClick(sticker)}>
                        <img src={sticker.url} alt={sticker.name} className="w-8 h-8" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!comment.trim()}
                className="ml-2 text-gray-400 hover:text-primary"
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
