import React, { useState, forwardRef, useRef, useEffect } from "react";
import { useGetCommentsQuery, useAddCommentMutation, useGetPostByIdQuery } from "../../api/dengueApi";
import { Smiley, PaperPlaneRight, UserCircle, CaretLeft, CaretRight } from "phosphor-react";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useSelector } from "react-redux";
import { DotsThree } from "phosphor-react";
import ReactionsTab from "./ReactionsTab";
import Comment2 from "./Comment2";
import profile1 from "../../assets/profile1.png";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const CommentModal = forwardRef(({ 
  postId, 
  onCommentAdded,
  upvotes = 0,
  downvotes = 0,
  commentsCount = 0,
  upvotesArray = [],
  downvotesArray = []
}, ref) => {
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [toast, setToast] = useState(null);
  const textareaRef = useRef(null);
  const userFromStore = useSelector((state) => state.auth?.user);
  const [addComment, { isLoading }] = useAddCommentMutation();
  const { data: comments, isLoading: isLoadingComments, refetch } = useGetCommentsQuery(postId);
  const { data: postData, isLoading: isLoadingPost } = useGetPostByIdQuery(postId);
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Preload images when post data changes
  useEffect(() => {
    if (postData?.data?.images) {
      const images = postData.data.images;
      images.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setPreloadedImages(prev => ({
            ...prev,
            [index]: true
          }));
        };
      });
    }
  }, [postData]);

  // Debug effect to track post data and current image index
  useEffect(() => {
    console.log('[DEBUG] Post Data:', postData);
    console.log('[DEBUG] Current Image Index:', currentImageIndex);
    if (postData?.data?.images) {
      console.log('[DEBUG] Available Images:', postData.data.images);
    }
  }, [postData, currentImageIndex]);

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
    if (!userFromStore) {
      showToast("Please log in to comment", "error");
      return;
    }
    if (!comment.trim()) return;
    try {
      await addComment({ reportId: postId, content: comment.trim() }).unwrap();
      setComment("");
      if (onCommentAdded) {
        onCommentAdded();
      }
      refetch();
    } catch (error) {
      console.error("Failed to add comment:", error);
      showToast("Failed to add comment", "error");
    }
  };

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      if (diffDays > 0) {
        return `${diffDays}d ago`;
      } else if (diffHours > 0) {
        return `${diffHours}h ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ago`;
      } else {
        return 'just now';
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "just now";
    }
  };

  const handleLoginClick = () => {
    showToast("Please log in to comment", "error");
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  if (isLoadingPost) {
    return (
      <dialog id="comment_modal" ref={ref} className="modal text-xl text-primary">
        <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] flex flex-col p-0">
          <div className="flex items-center justify-center h-32">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </dialog>
    );
  }

  const post = postData?.data;
  console.log('[DEBUG] Current Post:', post);

  const handlePreviousImage = () => {
    if (isTransitioning) return;
    
    console.log('[DEBUG] Previous Image Clicked');
    console.log('[DEBUG] Current Index:', currentImageIndex);
    console.log('[DEBUG] Total Images:', post?.images?.length);
    
    if (!post?.images?.length) {
      console.log('[DEBUG] No images available');
      return;
    }

    setIsTransitioning(true);
    const newIndex = currentImageIndex === 0 ? post.images.length - 1 : currentImageIndex - 1;
    console.log('[DEBUG] New Index:', newIndex);
    setCurrentImageIndex(newIndex);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const handleNextImage = () => {
    if (isTransitioning) return;
    
    console.log('[DEBUG] Next Image Clicked');
    console.log('[DEBUG] Current Index:', currentImageIndex);
    console.log('[DEBUG] Total Images:', post?.images?.length);
    
    if (!post?.images?.length) {
      console.log('[DEBUG] No images available');
      return;
    }

    setIsTransitioning(true);
    const newIndex = currentImageIndex === post.images.length - 1 ? 0 : currentImageIndex + 1;
    console.log('[DEBUG] New Index:', newIndex);
    setCurrentImageIndex(newIndex);
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <dialog id="comment_modal" ref={ref} className="modal text-xl text-primary">
     
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] flex flex-col p-0">
      {toast && (
        <div 
          className={`fixed top-[10%] left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg text-white text-[13px] shadow-lg z-[999999] transition-all duration-300 ${
            toast.type === "error" ? "bg-error" : "bg-info"
          }`}
        >
          {toast.message}
        </div>
      )}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-8 py-6 pt-7 border-b border-gray-400/70">
          <div className="flex-1"></div>
          <p className="text-2xl font-bold">
            {post?.isAnonymous ? "Anonymous Post" : "User's Post"}
          </p>
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
                    {post?.isAnonymous ? (
                      <UserCircle size={48} className="text-gray-400 mr-[-6px]" />
                    ) : (
                      <img
                        src={profile1}
                        className="h-12 w-12 rounded-full object-cover"
                        alt="profile"
                      />
                    )}
                    <div className="flex flex-col text-lg">
                      <p className="font-bold">
                        {post?.isAnonymous ? "Anonymous" : "User"}
                      </p>
                      <p>{formatTimestamp(post?.createdAt)}</p>
                    </div>
                  </div>
                  <DotsThree size={28} />
                </div>
                <p className="text-black">{post?.description}</p>
              </div>
              {post?.images && post.images.length > 0 && (
                <div className="w-full rounded-b-2xl bg-black flex justify-center items-center aspect-video max-h-170 relative overflow-hidden">
                  <div className="relative w-full h-full">
                    {post.images.map((src, index) => (
                      <img 
                        key={src}
                        src={src}
                        alt={`Post ${index + 1}`}
                        className={`absolute w-full h-full object-contain transition-opacity duration-300 ${
                          index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                          display: index === currentImageIndex ? 'block' : 'none'
                        }}
                      />
                    ))}
                  </div>
                  {post.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        disabled={isTransitioning}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-display disabled:opacity-50"
                      >
                        <CaretLeft size={24} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        disabled={isTransitioning}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-display disabled:opacity-50"
                      >
                        <CaretRight size={24} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {post.images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="border-y border-gray-400/70 mx-2 my-3 mt-4 px-2 py-1"> 
                <ReactionsTab 
                  postId={postId}
                  upvotes={upvotes}
                  downvotes={downvotes}
                  commentsCount={commentsCount}
                  iconSize={29}
                  upvotesArray={upvotesArray}
                  downvotesArray={downvotesArray}
                  currentUserId={userFromStore?.role === "user" ? userFromStore?._id : null}
                  onCommentClick={() => {}}
                  useCustomToast={true}
                  onShowToast={showToast}
                />
              </div>
            </div>
          </div>

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
                    commentId={comment._id}
                    upvotesArray={comment.upvotes || []}
                    downvotesArray={comment.downvotes || []}
                    currentUserId={userFromStore?.role === "user" ? userFromStore?._id : null}
                    onShowToast={showToast}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No comments yet</div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex items-start gap-3 px-4 py-4 shadow-[0_-1px_4px_2px_rgba(0,0,0,0.08)]">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={userFromStore?.profileImage || profile1}
            alt="profile"
          />
          <div className="flex-1 z-10 flex flex-col text-black">
            {userFromStore && userFromStore.role === "user" ? (
              <>
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
                    <div className="relative group">
                      <button type="button" onClick={() => setShowEmojiPicker(v => !v)}>
                        <Smiley size={20} className="cursor-pointer"/>
                      </button>
                      <p className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-display duration-600 ease-in-out whitespace-nowrap pointer-events-none">Add emoji</p>
                    </div>
                    {showEmojiPicker && (
                      <div className="absolute left-0 bottom-10 z-20">
                        <Picker
                          data={data}
                          onEmojiSelect={handleEmojiClick}
                          theme="light"
                          previewPosition="none"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="relative group cursor-pointer">
                    <button
                      type="submit"
                      disabled={!comment.trim() || isLoading}
                      className="ml-2 cursor-pointer text-gray-400 hover:text-primary disabled:opacity-50"
                    >
                      <PaperPlaneRight size={22} />
                    </button>
                    <p className="absolute -top-8.5 -right-7.5 bg-gray-600 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-display duration-600 ease-in-out whitespace-nowrap pointer-events-none">Send comment</p>
                  </div>
                </div>
              </>
            ) : (
              <div 
                onClick={handleLoginClick}
                className="bg-gray-200/60 px-4 text-lg py-2 rounded-2xl outline-none text-base cursor-pointer hover:bg-gray-200/80 transition-colors text-gray-500"
              >
                Log in to comment
              </div>
            )}
          </div>
        </form>
      </div>
    </dialog>
  );
});

export default CommentModal;
