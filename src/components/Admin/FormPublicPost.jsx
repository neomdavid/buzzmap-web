import { useRef, useState } from "react";
import { CalendarBlank, Clock, Image, Plus, X } from "phosphor-react";
import {
  useCreateAdminPostMutation,
  useGetAllAdminPostsQuery,
} from "../../api/dengueApi";
import { useSelector } from "react-redux"; // To get the token
import { toast } from "react-toastify";

const FormPublicPost = ({ onSuccess }) => {
  const [postType, setPostType] = useState("news");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postTime, setPostTime] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");
  const confirmRef = useRef(null);
  const [submitError, setSubmitError] = useState("");

  const [createAdminPost] = useCreateAdminPostMutation();
  const { refetch } = useGetAllAdminPostsQuery();
  const token = useSelector((state) => state.auth.token);

  const postTypes = [
    { id: "news", label: "News Updates" },
    { id: "tip", label: "Prevention Tips" },
    { id: "announcement", label: "Official Announcements" },
  ];

  const formatDisplayDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "--";
    try {
      const dt = new Date(`${dateStr}T${timeStr}`);
      return dt.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setImageError("");
    setSubmitError("");
    if (images.length === 0) {
      setImageError("At least one image is required.");
      return;
    }
    confirmRef.current?.showModal();
  };

  const handleConfirmPublish = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", postTitle);
      formData.append("content", postContent);
      formData.append("publishDate", `${postDate}T${postTime}:00Z`);
      formData.append("category", postType);
      images.forEach((img) => formData.append("images", img));

      await createAdminPost(formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      confirmRef.current?.close();

      // Success toast (minimal)
      toast.success(
        <div className="text-sm">
          <p className="text-[14px]">Post scheduled/published</p>
          <div className="mt-2">
            <p className="text-[12px] text-gray-700">Category: {postType}</p>
            <p className="text-[12px] text-gray-700">Title: {postTitle}</p>
            <p className="text-[12px] text-gray-700">
              When: {postDate} {postTime}
            </p>
          </div>
        </div>,
        { autoClose: 4000, icon: false }
      );

      // Reset form
      setPostType("news");
      setPostTitle("");
      setPostContent("");
      setPostDate("");
      setPostTime("");
      setImages([]);
      setImagePreviews([]);
      setSubmitError("");

      // Refresh table and close parent modal
      refetch();
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      console.error("Post upload error:", err);
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to publish post. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageError(""); // Clear previous errors

    if (images.length + files.length > 8) {
      setImageError("Maximum 8 images allowed");
      return;
    }

    // Define accepted image file types
    const acceptedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/svg+xml",
    ];

    // Validate each file type
    const invalidFiles = files.filter(
      (file) => !acceptedImageTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((file) => file.name).join(", ");
      const errorMessage = `The following files are not supported: ${invalidFileNames}. Please upload only image files (JPEG, PNG, GIF, WebP, BMP, SVG).`;
      setImageError(errorMessage);
      return;
    }

    // If all files are valid, add them
    const newImages = [...images, ...files];
    setImages(newImages);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white h-full max-w-5xl"
      >
        <div className="w-full bg-primary text-white text-center py-3">
          <p className="text-xl font-semibold">Public Information Posts</p>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Post Type <span className="text-error">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    postType === type.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Content <span className="text-error">*</span>
            </label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your post content here..."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-primary font-semibold">
                Publish Date <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-primary font-semibold">
                Publish Time <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={postTime}
                  onChange={(e) => setPostTime(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Set current date/time */}
          <div className="w-full flex justify-center">
            <button
              type="button"
              className="btn btn-sm rounded-full btn-outline text-primary border-primary hover:bg-primary hover:text-white"
              onClick={() => {
                const now = new Date();
                const dateStr = now.toISOString().slice(0, 10);
                const timeStr = now.toTimeString().slice(0, 5);
                setPostDate(dateStr);
                setPostTime(timeStr);
              }}
            >
              Use current date & time
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-primary font-semibold">
              Upload Images (Max 8) <span className="text-error">*</span>
            </label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 8}
                />
                <Image size={24} className="text-gray-500" />
                <span className="text-gray-600">
                  {images.length > 0
                    ? "Add more images"
                    : "Click to upload images"}
                </span>
                <Plus size={20} className="text-gray-500" />
              </label>
              <div className="text-sm text-gray-600">
                <p>
                  Accepted file types: JPEG, PNG, GIF, WebP, BMP, SVG (Max 8
                  images)
                </p>
              </div>
              {imageError && (
                <div className="alert alert-error text-sm mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{imageError}</span>
                </div>
              )}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-error rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {images[index].name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-dark transition-colors rounded-full font-semibold text-white py-2 px-8 text-lg shadow-md hover:cursor-pointer hover:bg-primary/90"
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
          {submitError && (
            <div className="mt-3 text-error text-sm text-center bg-error/10 border border-error/20 rounded-lg py-2 px-3">
              {submitError}
            </div>
          )}
        </div>
      </form>

      {/* Confirm Publish Dialog */}
      <dialog
        ref={confirmRef}
        className="modal transition-transform duration-300 ease-in-out z-[-1]"
      >
        <div className="modal-box border-t-10 border-t-primary bg-white rounded-3xl shadow-2xl w-6/12 max-w-4xl p-6 py-10 relative">
          <button
            className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => confirmRef.current?.close()}
          >
            ✕
          </button>
          <div className="space-y-6">
            <p className="text-center text-3xl font-bold mb-2">
              <span className="text-primary">Confirm Publish</span>
            </p>
            <hr className="border-gray-300" />
            <div className="grid grid-cols-1 gap-4 text-primary text-lg">
              <div>
                <p className="mb-1 font-bold">Category</p>
                <div className="bg-base-200 rounded-lg p-3 text-gray-700">
                  {postType}
                </div>
              </div>
              <div>
                <p className="mb-1 font-bold">Title</p>
                <div className="bg-base-200 rounded-lg p-3 text-gray-700 break-words">
                  {postTitle || "(no title)"}
                </div>
              </div>
              <div>
                <p className="mb-1 font-bold">Content</p>
                <div className="bg-base-200 rounded-lg p-3 text-gray-700 break-words max-h-60 overflow-auto">
                  {postContent || "(no content)"}
                </div>
              </div>
              <div>
                <p className="mb-1 font-bold">Images</p>
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                          {images[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-base-200 rounded-lg p-3 text-gray-700">
                    No images
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1 font-bold">Date and time</p>
                <div className="bg-base-200 rounded-lg p-3 text-gray-700">
                  {formatDisplayDateTime(postDate, postTime)}
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              <button
                onClick={handleConfirmPublish}
                className="bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200 flex items-center gap-2 hover:cursor-pointer disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
              <button
                onClick={() => confirmRef.current?.close()}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-200 hover:cursor-pointer disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
            {submitError && (
              <div className="mt-4 text-error text-sm text-center bg-error/10 border border-error/20 rounded-lg py-2 px-3">
                {submitError}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
};

// Helper component to render post content with preserved newlines and blue hashtags
export const PostContentDisplay = ({ content }) => (
  <div style={{ whiteSpace: "pre-line" }}>
    {content.split("\n").map((line, idx) =>
      line.trim().startsWith("#") ? (
        <span key={idx} style={{ color: "blue" }}>
          {line}
          {"\n"}
        </span>
      ) : (
        <span key={idx}>
          {line}
          {"\n"}
        </span>
      )
    )}
  </div>
);

export default FormPublicPost;
