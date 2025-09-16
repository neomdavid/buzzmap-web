import React, { useState, useEffect, useRef } from "react";
import ReactionsTab from "./ReactionsTab";
import ImageGrid from "./ImageGrid";
import { UserDetailsTab } from "../";
import { useSelector } from "react-redux";
import CommentModal from "./CommentModal";
import { ImageExpansionModal } from "../";
import { toastInfo } from "../../utils.jsx";
import {
  useGetCommentsQuery,
  useDeletePostMutation,
} from "../../api/dengueApi";
import defaultProfile from "../../assets/default_profile.png";
import { DotsThree, Trash } from "phosphor-react";
import { toast } from "react-toastify";

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
  userId, // Add userId prop
  currentUserId, // Add currentUserId prop
  onVoteUpdate, // Add onVoteUpdate prop
  basicProfiles = [], // Add basicProfiles prop
  onPostDeleted, // Add callback for when post is deleted
  readOnly = false, // New prop to disable interactions
}) => {
  const userFromStore = useSelector((state) => state.auth?.user);
  const commentModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  // State for image expansion modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Handle image click
  const handleImageClick = (image, e) => {
    e?.stopPropagation();
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  // Handle image modal close
  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // Delete post mutation
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for options dropdown
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Get user profile from basicProfiles if available, otherwise use props
  const getUserProfile = () => {
    if (basicProfiles.length > 0 && userId) {
      const profile = basicProfiles.find((p) => p._id === userId);
      if (!profile) {
        // If no profile found, check if profileImage is empty and use default
        const fallbackImage =
          profileImage && profileImage.trim() !== ""
            ? profileImage
            : defaultProfile;
        return { username, profilePhotoUrl: fallbackImage };
      }
      // If profilePhotoUrl is empty string or null/undefined, use default
      const profilePhotoUrl =
        profile.profilePhotoUrl && profile.profilePhotoUrl.trim() !== ""
          ? profile.profilePhotoUrl
          : defaultProfile;
      return { ...profile, profilePhotoUrl };
    }
    // Check if profileImage is empty and use default
    const fallbackImage =
      profileImage && profileImage.trim() !== ""
        ? profileImage
        : defaultProfile;
    return { username, profilePhotoUrl: fallbackImage };
  };

  const userProfile = getUserProfile();

  // Check if current user can delete this post (post owner or admin)
  const canDeletePost =
    currentUserId === userId || userFromStore?.role === "admin";

  // Fetch actual comments to get real count
  const { data: actualComments } = useGetCommentsQuery(postId, {
    skip: !postId,
  });

  // Calculate actual comment count from fetched comments
  const actualCommentCount = actualComments ? actualComments.length : 0;
  const [localCommentCount, setLocalCommentCount] = useState(
    actualCommentCount || commentsCount || _commentCount || 0
  );

  // Update local comment count when actual comments change
  useEffect(() => {
    if (actualComments) {
      setLocalCommentCount(actualComments.length);
    }
  }, [actualComments]);

  // No longer need to fetch user profile data individually since we get it from basicProfiles

  // Only update from props if we don't have actual comments data
  useEffect(() => {
    if (!actualComments) {
      const newCommentCount = commentsCount || _commentCount || 0;
      if (newCommentCount !== localCommentCount) {
        setLocalCommentCount(newCommentCount);
      }
    }
  }, [actualComments, commentsCount, _commentCount, localCommentCount]);

  const handleCommentClick = () => {
    if (commentModalRef.current) {
      commentModalRef.current.showModal();
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    try {
      await deletePost(postId).unwrap();

      // Show success toast with trash icon
      toast.success(
        <div className="flex items-center gap-2">
          <Trash size={20} className="text-white" />
          <span>Post deleted successfully</span>
        </div>,
        {
          icon: false,
          position: "top-right",
          autoClose: 3000,
        }
      );

      // Close modal
      setShowDeleteModal(false);

      // Call parent callback if provided
      if (onPostDeleted) {
        onPostDeleted(postId);
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to delete post. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsDropdown && !event.target.closest(".options-container")) {
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptionsDropdown]);

  // Listen for modal close events to reset state
  useEffect(() => {
    const modal = deleteModalRef.current;
    if (!modal) return;

    const handleClose = () => {
      setShowDeleteModal(false);
      setShowOptionsDropdown(false);
    };

    // Listen for the close event
    modal.addEventListener("close", handleClose);

    // Also listen for clicks on modal-backdrop
    const handleBackdropClick = (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        setShowDeleteModal(false);
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener("click", handleBackdropClick);

    return () => {
      modal.removeEventListener("close", handleClose);
      document.removeEventListener("click", handleBackdropClick);
    };
  }, []);

  // Removed card-level click to avoid unintended modal opens

  return (
    <div className="shadow-sm bg-white rounded-lg px-6 pt-6 pb-4">
      {/* Header with user details and options */}
      <div className="flex justify-between items-start mb-4">
        <UserDetailsTab
          profileImage={userProfile.profilePhotoUrl}
          username={userProfile.username}
          timestamp={timestamp}
        />

        {/* Options menu - only show if user can delete */}
        {canDeletePost && (
          <div
            className="relative options-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Post options"
            >
              <DotsThree size={20} className="text-gray-500" />
            </button>

            {/* Options Dropdown */}
            {showOptionsDropdown && (
              <div className="absolute p-1 right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 hover:cursor-pointer"
                  >
                    <Trash size={16} />
                    Delete Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="text-primary flex flex-col gap-2 cursor-pointer"
        onClick={handleCommentClick}
      >
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
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </span>
        </p>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <ImageGrid images={images} onImageClick={handleImageClick} />
      </div>

      <hr className="text-gray-200 mt-4 mb-2" />
      {!readOnly && (
        <ReactionsTab
          postId={postId}
          upvotes={upvotes}
          downvotes={downvotes}
          commentsCount={localCommentCount}
          upvotesArray={upvotesArray}
          downvotesArray={downvotesArray}
          currentUserId={currentUserId}
          onCommentClick={handleCommentClick}
          iconSize={30}
          onVoteUpdate={undefined}
        />
      )}

      {!readOnly && (
        <CommentModal
          ref={commentModalRef}
          postId={postId}
          upvotes={upvotes}
          downvotes={downvotes}
          commentsCount={localCommentCount}
          upvotesArray={upvotesArray}
          downvotesArray={downvotesArray}
          onVoteUpdate={undefined}
          onCommentAdded={() => {
            setLocalCommentCount((prev) => prev + 1);
          }}
        />
      )}

      {/* Delete Confirmation Modal - DaisyUI Style */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box w-11/12 max-w-2xl rounded-2xl relative">
          {/* X Button - Top Right */}
          <form method="dialog">
            <button
              className="btn btn-md btn-circle btn-ghost absolute right-6 top-4"
              disabled={isDeleting}
            >
              ✕
            </button>
          </form>

          <div className="text-center">
            {/* <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <Trash size={24} className="text-red-600" />
            </div> */}
            <p className="text-2xl font-bold text-gray-700 mb-4">
              Delete Post?
            </p>
            <hr className="text-gray-300 mb-4" />
            <p className="text-md text-gray-600 mb-6">
              You cannot retrieve deleted posts. This action cannot be undone.
            </p>
            <div className="modal-action justify-end">
              <form method="dialog">
                <button className="btn btn-outline" disabled={isDeleting}>
                  Cancel
                </button>
              </form>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className={`btn btn-error ${isDeleting ? "loading" : ""}`}
              >
                {isDeleting ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Modal backdrop for closing */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Show modal when showDeleteModal is true */}
      {showDeleteModal && deleteModalRef.current?.showModal()}

      {/* Image Expansion Modal */}
      <ImageExpansionModal
        isOpen={isImageModalOpen}
        onClose={handleImageModalClose}
        image={selectedImage}
      />
    </div>
  );
};

export default PostCard;
